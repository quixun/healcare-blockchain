async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
    const medicalRecords = await MedicalRecords.deploy();

    // Wait for the contract to be deployed (ethers v6 style)
    await medicalRecords.waitForDeployment();

    console.log("MedicalRecords contract deployed to:", await medicalRecords.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });