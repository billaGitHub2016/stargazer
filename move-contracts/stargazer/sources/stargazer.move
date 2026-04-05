module smart_gate_extension::stargazer;

use sui::balance::{Self, Balance};
use sui::clock::Clock;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use std::string::String;
use sui::event;
use world::{character::Character, gate::{Self, Gate}};

// === Auth ===
public struct StargazerAuth has drop {}

// === Errors ===
#[error(code = 0)]
const ENotOwner: vector<u8> = b"Not the rule owner";
#[error(code = 1)]
const EInsufficientFee: vector<u8> = b"Insufficient fee paid";
#[error(code = 2)]
const EInvalidSourceGate: vector<u8> = b"Invalid source gate provided";
#[error(code = 3)]
const EInvalidDestinationGate: vector<u8> = b"Invalid destination gate provided";

// === Structs ===
/// The toll rule created by a player. Shared object.
public struct TollRule has key {
    id: UID,
    owner: address,
    fee_amount: u64,
    description: String,
    source_gate_id: ID,
    destination_gate_id: ID,
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
public fun create_rule(
    fee_amount: u64, 
    description: String,
    source_gate_id: ID,
    destination_gate_id: ID,
    ctx: &mut TxContext
) {
    let owner = ctx.sender();
    let id = object::new(ctx);
    let rule_id = id.to_inner();

    let rule = TollRule {
        id,
        owner,
        fee_amount,
        description,
        source_gate_id,
        destination_gate_id,
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

/// Owner can update the description
public fun update_description(rule: &mut TollRule, new_description: String, ctx: &mut TxContext) {
    assert!(ctx.sender() == rule.owner, ENotOwner);
    rule.description = new_description;
}

/// Owner can delete the rule and reclaim any remaining SUI in the vault
public fun delete_rule(rule: TollRule, ctx: &mut TxContext) {
    assert!(ctx.sender() == rule.owner, ENotOwner);
    let TollRule { id, owner: _, fee_amount: _, description: _, source_gate_id: _, destination_gate_id: _, vault } = rule;
    
    // Return any remaining funds in the vault to the owner
    let remaining_balance = vault.value();
    if (remaining_balance > 0) {
        let remaining_coin = coin::from_balance(vault, ctx);
        transfer::public_transfer(remaining_coin, ctx.sender());
    } else {
        vault.destroy_zero();
    };
    
    object::delete(id);
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
    // Validate that the passed gates match the rule configuration
    assert!(object::id(source_gate) == rule.source_gate_id, EInvalidSourceGate);
    assert!(object::id(destination_gate) == rule.destination_gate_id, EInvalidDestinationGate);

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
    
    gate::issue_jump_permit<StargazerAuth>(
        source_gate,
        destination_gate,
        character,
        StargazerAuth {},
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
