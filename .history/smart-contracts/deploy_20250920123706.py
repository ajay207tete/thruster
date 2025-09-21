import asyncio
import json
from tonclient.client import TonClient, ClientConfig
from tonclient.types import NetworkConfig, DeploySet, CallSet, Signer, ParamsOfEncodeMessage, ParamsOfSendMessage, ParamsOfWaitForTransaction

async def deploy_contract():
    # Initialize TON client for testnet
    config = ClientConfig(network=NetworkConfig(server_address="https://net.ton.dev"))
    client = TonClient(config=config)

    # Load contract ABI and TVC
    with open("contracts/ShoppingContract.abi.json", "r") as abi_file:
        contract_abi = json.load(abi_file)
    with open("contracts/ShoppingContract.tvc", "rb") as tvc_file:
        contract_tvc = tvc_file.read().hex()

    # Generate keys for the contract
    keypair = await client.crypto.generate_random_sign_keys()

    # Deploy set
    deploy_set = DeploySet(tvc=contract_tvc)
    call_set = CallSet(function_name="constructor", input={})
    signer = Signer.Keys(keys=keypair)

    # Encode message
    params = ParamsOfEncodeMessage(
        abi=contract_abi,
        deploy_set=deploy_set,
        call_set=call_set,
        signer=signer
    )
    message = await client.abi.encode_message(params=params)

    # Send message
    send_params = ParamsOfSendMessage(
        message=message.message,
        send_events=False
    )
    await client.processing.send_message(params=send_params)

    # Wait for transaction
    wait_params = ParamsOfWaitForTransaction(
        message=message.message,
        shard_block_id=None,
        send_events=False
    )
    result = await client.processing.wait_for_transaction(params=wait_params)

    print(f"Contract deployed at address: {message.address}")
    print(f"Public key: {keypair['public']}")
    print(f"Secret key: {keypair['secret']}")

    # Close client
    await client.close()

if __name__ == "__main__":
    asyncio.run(deploy_contract())
