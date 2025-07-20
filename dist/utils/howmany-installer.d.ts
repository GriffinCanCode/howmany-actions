export declare class HowManyInstaller {
    private version;
    constructor(version?: string);
    /**
     * Install howmany CLI tool
     */
    install(): Promise<string>;
    /**
     * Install howmany from crates.io using cargo
     */
    private installFromCargo;
    /**
     * Ensure cargo is installed and available
     */
    private ensureCargoInstalled;
    /**
     * Install Rust toolchain using rustup
     */
    private installRustToolchain;
    /**
     * Verify howmany installation and return the path
     */
    private verifyInstallation;
    /**
     * Get the installed version of howmany
     */
    getInstalledVersion(): Promise<string>;
}
//# sourceMappingURL=howmany-installer.d.ts.map