#!/usr/bin/env python3
"""
Simple TON Smart Contract Deployment Script
Direct deployment without complex ABI handling
"""

import asyncio
import sys
from tonclient.client import TonClient, ClientConfig
from tonclient.types import NetworkConfig, DeploySet, CallSet, Signer, ParamsOfEncodeMessage, ParamsOfSendMessage, ParamsOfWaitForTransaction

async def deploy_contract():
    """Deploy the ShoppingContract to TON testnet"""

    # Initialize TON client for testnet
    print("🔗 Initializing TON client...")
    config = ClientConfig(network=NetworkConfig(server_address="https://net.ton.dev"))
    client = TonClient(config=config)
    print("✅ TON client initialized successfully")

    # Mock ABI for the ShoppingContract
    contract_abi = {
        "version": "2.0",
        "functions": [
            {
                "name": "constructor",
                "inputs": [],
                "outputs": []
            }
        ]
    }

    # Mock TVC (compiled contract code)
    contract_tvc = "mock_compiled_shopping_contract_code"

    # Generate keys for the contract
    print("🔑 Generating keypair...")
    keypair = client.crypto.generate_random_sign_keys()
    print("✅ Keypair generated successfully")

    # Create deploy set
    deploy_set = DeploySet(tvc=contract_tvc)
    call_set = CallSet(function_name="constructor", input={})
    signer = Signer.Keys(keys=keypair)

    # Encode message
    print("📝 Encoding deployment message...")
    params = ParamsOfEncodeMessage(
        abi=contract_abi,
        deploy_set=deploy_set,
        call_set=call_set,
        signer=signer
    )

    try:
        message = await client.abi.encode_message(params=params)
        print(f"📍 Contract address: {message.address}")

        # Send message
        print("📤 Sending deployment transaction...")
        send_params = ParamsOfSendMessage(
            message=message.message,
            send_events=False
        )
        await client.processing.send_message(params=send_params)

        # Wait for transaction
        print("⏳ Waiting for transaction confirmation...")
        wait_params = ParamsOfWaitForTransaction(
            message=message.message,
            shard_block_id=None,
            send_events=False
        )
        result = await client.processing.wait_for_transaction(params=wait_params)

        print("✅ Contract deployed successfully!")
        print(f"🔗 Transaction ID: {result.transaction.id}")
        print(f"📊 Block: {result.transaction.block_id}")
        print(f"📍 Contract Address: {message.address}")
        print(f"🔑 Public Key: {keypair.get('public', 'unknown')}")
        print(f"🔐 Secret Key: {keypair.get('secret', 'unknown')}")

        return {
            "address": message.address,
            "transaction_id": result.transaction.id,
            "block_id": result.transaction.block_id,
            "public_key": keypair.get("public", "unknown"),
            "secret_key": keypair.get("secret", "unknown")
        }

    except Exception as e:
        print(f"❌ Deployment failed: {str(e)}")
        return None

if __name__ == "__main__":
    result = asyncio.run(deploy_contract())
    if result:
        print("\n✅ Deployment completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Deployment failed!")
        sys.exit(1)
