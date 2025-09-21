import unittest
import asyncio
import json
from tonclient.client import ClientConfig, TonClient
from tonclient.types import DeploySet, CallSet, Signer, ParamsOfEncodeMessage,  NetworkConfig

class TestShoppingContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        network_cfg = NetworkConfig(server_address="https://net.ton.dev")
        cls.client = TonClient(config=ClientConfig(network=network_cfg))
        cls.abi = None
        cls.tvc = None
        cls.address = None

    def test_compile_contract(self):
        async def compile():
            with open("contracts/ShoppingContract.fc", "r") as f:
                source = f.read()
            with open("stdlib.fc", "r") as f:
                stdlib = f.read()
            compiled = await self.client.abi.compile(source=source, stdlib=stdlib)
            self.abi = json.loads(compiled.abi)
            self.tvc = compiled.tvc
        asyncio.run(compile())
        self.assertIsNotNone(self.abi)
        self.assertIsNotNone(self.tvc)

    def test_deploy_contract(self):
        async def deploy():
            deploy_set = DeploySet(tvc=self.tvc)
            call_set = CallSet(function_name="constructor", input={})
            signer = Signer.Keys(keys=self.client.crypto.generate_random_sign_keys())
            params = ParamsOfEncodeMessage(
                abi=self.abi,
                deploy_set=deploy_set,
                call_set=call_set,
                signer=signer,
            )
            encode_result = await self.client.abi.encode_message(params=params)
            self.address = encode_result.address
            self.assertIsNotNone(self.address)

            send_params = ParamsOfSendMessage(
                message=encode_result.message,
                send_events=False,
            )
            await self.client.processing.send_message(params=send_params)
            wait_params = ParamsOfWaitForTransaction(
                message=encode_result.message,
                shard_block_id=None,
                send_events=False,
            )
            await self.client.processing.wait_for_transaction(params=wait_params)
            self.assertTrue(True)  # If no exceptions, deployment succeeded

        asyncio.run(deploy())

if __name__ == "__main__":
    unittest.main()
