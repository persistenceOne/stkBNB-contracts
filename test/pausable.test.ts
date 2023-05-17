import { deployStakePoolFixture, deployStakedBnbTokenFixture } from "./helpers/fixtures";
import { PausableTest, initiatePausableTests } from "./helpers/testGenerators/pausable";

const DEFAULT_OWNER_NAME = "deployer";

const tests: PausableTest[] = [
  {
    deploymentFixture: deployStakedBnbTokenFixture,
    contractObjectName: "stakedBNBToken",
    ownerObjectName: DEFAULT_OWNER_NAME,
  },
  {
    deploymentFixture: deployStakePoolFixture,
    contractObjectName: "stakePoolProxy",
    ownerObjectName: DEFAULT_OWNER_NAME,
    pausedUponCreation: true
  }
]

describe("Pausable tests", async () => {
  await initiatePausableTests(tests);
})