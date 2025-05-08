
async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const Marketplace = await ethers.getContractFactory('Marketplace');
    const marketPlace = await Marketplace.deploy();

    // const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
    // const medicalRecords = await MedicalRecords.deploy();

    // Wait for the contract to be deployed (ethers v6 style)
    // await medicalRecords.waitForDeployment();
    await marketPlace.waitForDeployment();

    // console.log("MedicalRecords contract deployed to:", await medicalRecords.getAddress());
    console.log("MedicalRecords contract deployed to:", await marketPlace.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });