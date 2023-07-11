import { deployAddressStoreFixture, deployFeeVaultFixture, deployStakedBnbTokenFixture } from "./helpers/fixtures";
import { OwnershipTest, initiateOwnershipTests } from "./helpers/testGenerators/ownable";

const DEFAULT_OWNER_NAME = "deployer";

const tests: OwnershipTest[] = [
  {
    deploymentFixture: deployAddressStoreFixture,
    contractObjectName: "addressStore",
    ownerObjectName: DEFAULT_OWNER_NAME
  },
  {
    deploymentFixture: deployFeeVaultFixture,
    contractObjectName: "feeVaultProxy",
    ownerObjectName: DEFAULT_OWNER_NAME
  }
]

describe("Ownership tests", async () => {
  await initiateOwnershipTests(tests);
})