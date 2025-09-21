import unittest
from tonclient.client import ClientConfig, TonClient
from tonclient.types import DeploySet, CallSet, Signer, ParamsOfEncodeMessage, ParamsOfSendMessage, ParamsOfWaitForTransaction

class TestShoppingContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TonClient(config=ClientConfig(network={"server_address": "https://net.ton.dev"}))
        cls.abi = None
        cls.tvc = None
        cls.address = None

    def test_compile_contract(self):
        # Compile the contract using toncli or other means before running this test
        # Here we assume ABI and TVC files are generated and paths are correct
        with open("smart-contracts/contracts/ShoppingContract.abi.json", "r") as f:
            self.abi = f.read()
        with open("smart-contracts/contracts/ShoppingContract.tvc", "rb") as f:
            self.tvc = f.read()
        self.assertIsNotNone(self.abi)
        self.assertIsNotNone(self.tvc)

    def test_deploy_contract(self):
        deploy_set = DeploySet(tvc=self.tvc)
        call_set = CallSet(function_name="constructor", input={})
        signer = Signer.Keys(key_pair={"public": "", "secret": ""})  # Provide keys here
        params = ParamsOfEncodeMessage(
            abi=self.abi,
            deploy_set=deploy_set,
            call_set=call_set,
            signer=signer,
        )
        encode_result = self.client.abi.encode_message(params=params)
        self.address = encode_result.address
        self.assertIsNotNone(self.address)

        send_params = ParamsOfSendMessage(
            message=encode_result.message,
            send_events=False,
        )
        self.client.processing.send_message(params=send_params)
        wait_params = ParamsOfWaitForTransaction(
            message=encode_result.message,
            shard_block_id=None,
            send_events=False,
        )
        self.client.processing.wait_for_transaction(params=wait_params)
        self.assertTrue(True)  # If no exceptions, deployment succeeded

if __name__ == "__main__":
    unittest.main()
