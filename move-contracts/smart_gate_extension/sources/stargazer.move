module smart_gate_extension::stargazer;

use smart_gate_extension::config::{Self, XAuth};
use sui::balance::{Self, Balance};
use sui::clock::Clock;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::event;
use world::{character::Character, gate::{Self, Gate}};

// === Errors ===
#[error(code = 0)]
const ENotOwner: vector<u8> = b"Not the rule owner";
#[error(code = 1)]
const EInsufficientFee: vector<u8> = b"Insufficient fee paid";

// === Structs ===
/// The toll rule created by a player. Shared object.
public struct TollRule has key {
    id: UID,
    owner: address,
    fee_amount: u64,
    vault: Balance<SUI>,
}

/// Event emitted when a rule is created
public struct RuleCreated has copy, drop {
    rule_id: ID,
    owner: address,
    fee_amount: u64,
}

// === Public Functions ===

/// Factory function to create a new TollRule
public fun create_rule(fee_amount: u64, ctx: &mut TxContext) {
    let owner = ctx.sender();
    let id = object::new(ctx);
    let rule_id = id.to_inner();

    let rule = TollRule {
        id,
        owner,
        fee_amount,
        vault: balance::zero(),
    };

    transfer::share_object(rule);

    event::emit(RuleCreated {
        rule_id,
        owner,
        fee_amount,
    });
}

/// Owner can update the fee amount
public fun update_rule(rule: &mut TollRule, new_fee: u64, ctx: &mut TxContext) {
    assert!(ctx.sender() == rule.owner, ENotOwner);
    rule.fee_amount = new_fee;
}

/// Owner can withdraw from the vault
public fun withdraw_tolls(rule: &mut TollRule, ctx: &mut TxContext): Coin<SUI> {
    assert!(ctx.sender() == rule.owner, ENotOwner);
    let amount = rule.vault.value();
    let withdrawn = balance::split(&mut rule.vault, amount);
    coin::from_balance(withdrawn, ctx)
}

/// A player pays the toll to get a JumpPermit.
#[allow(lint(self_transfer))]
public fun pay_toll_and_jump(
    rule: &mut TollRule,
    mut payment: Coin<SUI>,
    source_gate: &Gate,
    destination_gate: &Gate,
    character: &Character,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(payment.value() >= rule.fee_amount, EInsufficientFee);

    let payment_balance = coin::balance_mut(&mut payment);
    let fee_balance = balance::split(payment_balance, rule.fee_amount);
    
    balance::join(&mut rule.vault, fee_balance);
    
    // Refund the rest if any
    if (payment.value() > 0) {
        transfer::public_transfer(payment, ctx.sender());
    } else {
        payment.destroy_zero();
    };

    // Issue jump permit
    let expiry_ms = 5 * 60 * 1000;
    let ts = clock.timestamp_ms();
    let expires_at_timestamp_ms = ts + expiry_ms;
    
    gate::issue_jump_permit<XAuth>(
        source_gate,
        destination_gate,
        character,
        config::x_auth(),
        expires_at_timestamp_ms,
        ctx,
    );
}

/// A simplified payment function for web MVP testing (doesn't require game objects)
#[allow(lint(self_transfer))]
public fun pay_toll_only(
    rule: &mut TollRule,
    mut payment: Coin<SUI>,
    ctx: &mut TxContext,
) {
    assert!(payment.value() >= rule.fee_amount, EInsufficientFee);

    let payment_balance = coin::balance_mut(&mut payment);
    let fee_balance = balance::split(payment_balance, rule.fee_amount);
    
    balance::join(&mut rule.vault, fee_balance);
    
    // Refund the rest if any
    if (payment.value() > 0) {
        transfer::public_transfer(payment, ctx.sender());
    } else {
        payment.destroy_zero();
    };
}

// === View Functions ===
public fun get_fee_amount(rule: &TollRule): u64 {
    rule.fee_amount
}

public fun get_owner(rule: &TollRule): address {
    rule.owner
}
