import asyncio
import json
from tonclient.client import TonClient, ClientConfig
from tonclient.types import NetworkConfig
from tonclient.types import DeploySet, CallSet, Signer, ParamsOfEncodeMessage, ParamsOfSendMessage, ParamsOfWaitForTransaction, ParamsOfCompile

async def deploy_contract():
    # Initialize TON client for testnet
    config = ClientConfig(network=NetworkConfig(server_address="https://net.ton.dev"))
    client = TonClient(config=config)

    # Load contract source code
    with open("smart-contracts/contracts/ShoppingContract.fc", "r") as source_file:
        contract_source = source_file.read()

    # Compile the contract
    compile_params = ParamsOfCompile(
        source=contract_source,
        stdlib="smart-contracts/stdlib.fc"
    )
    compiled = await client.abi.compile(params=compile_params)

    contract_abi = json.loads(compiled.abi)
    contract_tvc = compiled.tvc

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
