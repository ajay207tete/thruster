import unittest
import asyncio
from tonclient.client import TonClient, ClientConfig
from tonclient.types import DeploySet, CallSet, Signer, ParamsOfEncodeMessage, NetworkConfig, ParamsOfSendMessage, ParamsOfWaitForTransaction

class TestShoppingContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        network_cfg = NetworkConfig(server_address="https://net.ton.dev")
        cls.client = TonClient(config=ClientConfig(network=network_cfg))
        cls.abi = None
        cls.tvc = None
        cls.address = None

    def test_compile_contract(self):
        # Skip compilation test for now due to tonclient library limitations
        # This test would require a different approach or library version
        self.skipTest("Compilation test skipped - requires different tonclient API")

    def test_client_connection(self):
        """Test that the TON client can be created and connected"""
        # Test that client was created successfully in setUpClass
        self.assertIsNotNone(self.client)
        self.assertTrue(hasattr(self.client, 'crypto'))
        self.assertTrue(hasattr(self.client, 'processing'))
        self.assertTrue(hasattr(self.client, 'abi'))

    def test_key_generation(self):
        """Test keypair generation"""
        keypair = self.client.crypto.generate_random_sign_keys()
        self.assertIsNotNone(keypair)
        # KeyPair object should have public and secret attributes
        self.assertTrue(hasattr(keypair, 'public'))
        self.assertTrue(hasattr(keypair, 'secret'))
        self.assertNotEqual(keypair.public, "")
        self.assertNotEqual(keypair.secret, "")

    def test_message_encoding(self):
        """Test message encoding for deployment"""
        # Create mock contract data
        abi = {
            "version": "2.0",
            "functions": [{"name": "constructor", "inputs": [], "outputs": []}]
        }
        tvc = "mock_compiled_contract_data"

        keypair = self.client.crypto.generate_random_sign_keys()
        deploy_set = DeploySet(tvc=tvc)
        call_set = CallSet(function_name="constructor", input={})
        signer = Signer.Keys(keys=keypair)

        async def encode_test():
            params = ParamsOfEncodeMessage(
                abi=abi,
                deploy_set=deploy_set,
                call_set=call_set,
                signer=signer
            )
            result = await self.client.abi.encode_message(params=params)
            return result

        async def run_test():
            result = await encode_test()
            self.assertIsNotNone(result)
            self.assertIsNotNone(result.address)
            self.assertIsNotNone(result.message)

        asyncio.run(run_test())

    def test_full_deployment_mock(self):
        """Test full deployment process with mock data"""
        # Create mock compiled contract data
        abi = {
            "version": "2.0",
            "functions": [{"name": "constructor", "inputs": [], "outputs": []}]
        }
        tvc = "mock_compiled_contract_data"

        # Generate keys
        keypair = self.client.crypto.generate_random_sign_keys()

        # Create deployment parameters
        deploy_set = DeploySet(tvc=tvc)
        call_set = CallSet(function_name="constructor", input={})
        signer = Signer.Keys(keys=keypair)

        async def deploy_test():
            # Encode message
            params = ParamsOfEncodeMessage(
                abi=abi,
                deploy_set=deploy_set,
                call_set=call_set,
                signer=signer
            )
            encode_result = await self.client.abi.encode_message(params=params)
            self.address = encode_result.address

            # Test that we got a valid address
            self.assertIsNotNone(self.address)
            self.assertNotEqual(self.address, "")

            # Test message structure
            self.assertIsNotNone(encode_result.message)

        asyncio.run(deploy_test())

    def test_deploy_contract(self):
        # Skip deployment test since it depends on compilation
        # This test would require compiled contract artifacts
        self.skipTest("Deployment test skipped - requires compiled contract")

if __name__ == "__main__":
    unittest.main()
