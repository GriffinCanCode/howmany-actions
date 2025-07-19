import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import { promises as fs } from 'fs';
import * as path from 'path';

export class HowManyInstaller {
  private version: string;
  
  constructor(version: string = 'latest') {
    this.version = version;
  }
  
  /**
   * Install howmany CLI tool
   */
  async install(): Promise<string> {
    core.info(`Installing HowMany version: ${this.version}`);
    
    try {
      // Try to install from crates.io using cargo
      await this.installFromCargo();
      
      // Verify installation
      const howmanyPath = await this.verifyInstallation();
      core.info(`✅ HowMany installed successfully at: ${howmanyPath}`);
      
      return howmanyPath;
    } catch (error) {
      core.error(`Failed to install HowMany: ${error}`);
      throw new Error(`Installation failed: ${error}`);
    }
  }
  
  /**
   * Install howmany from crates.io using cargo
   */
  private async installFromCargo(): Promise<void> {
    core.info('Installing HowMany from crates.io...');
    
    // First, ensure cargo is available
    await this.ensureCargoInstalled();
    
    // Install howmany
    const installArgs = this.version === 'latest' 
      ? ['install', 'howmany']
      : ['install', 'howmany', '--version', this.version];
    
    const exitCode = await exec.exec('cargo', installArgs, {
      ignoreReturnCode: false,
      silent: false
    });
    
    if (exitCode !== 0) {
      throw new Error(`Cargo install failed with exit code: ${exitCode}`);
    }
  }
  
  /**
   * Ensure cargo is installed and available
   */
  private async ensureCargoInstalled(): Promise<void> {
    try {
      await exec.exec('cargo', ['--version'], { silent: true });
      core.info('✅ Cargo is available');
    } catch (error) {
      core.info('Cargo not found, installing Rust toolchain...');
      await this.installRustToolchain();
    }
  }
  
  /**
   * Install Rust toolchain using rustup
   */
  private async installRustToolchain(): Promise<void> {
    core.info('Installing Rust toolchain...');
    
    // Download and run rustup installer
    const rustupUrl = process.platform === 'win32' 
      ? 'https://win.rustup.rs/x86_64'
      : 'https://sh.rustup.rs';
    
    if (process.platform === 'win32') {
      // Windows installation
      const rustupPath = await tc.downloadTool(rustupUrl, 'rustup-init.exe');
      await exec.exec(rustupPath, ['-y', '--default-toolchain', 'stable']);
    } else {
      // Unix-like systems installation
      const rustupPath = await tc.downloadTool(rustupUrl, 'rustup-init.sh');
      await exec.exec('chmod', ['+x', rustupPath]);
      await exec.exec('sh', [rustupPath, '-y', '--default-toolchain', 'stable']);
    }
    
    // Add cargo to PATH
    const cargoPath = process.platform === 'win32'
      ? path.join(process.env.USERPROFILE || '', '.cargo', 'bin')
      : path.join(process.env.HOME || '', '.cargo', 'bin');
    
    core.addPath(cargoPath);
    core.info(`✅ Rust toolchain installed, cargo added to PATH: ${cargoPath}`);
    
    // Verify cargo is now available
    await exec.exec('cargo', ['--version']);
  }
  
  /**
   * Verify howmany installation and return the path
   */
  private async verifyInstallation(): Promise<string> {
    try {
      // Try to find howmany in PATH
      const howmanyPath = await io.which('howmany', true);
      
      // Verify it works
      await exec.exec('howmany', ['--version'], { silent: true });
      
      return howmanyPath;
    } catch (error) {
      // If not in PATH, check common cargo installation locations
      const possiblePaths = [
        path.join(process.env.HOME || '', '.cargo', 'bin', 'howmany'),
        path.join(process.env.USERPROFILE || '', '.cargo', 'bin', 'howmany.exe'),
        '/usr/local/bin/howmany',
        './target/release/howmany'
      ];
      
      for (const possiblePath of possiblePaths) {
        try {
          await fs.access(possiblePath);
          await exec.exec(possiblePath, ['--version'], { silent: true });
          core.info(`Found HowMany at: ${possiblePath}`);
          return possiblePath;
        } catch {
          // Continue to next path
        }
      }
      
      throw new Error('HowMany installation could not be verified');
    }
  }
  
  /**
   * Get the installed version of howmany
   */
  async getInstalledVersion(): Promise<string> {
    let output = '';
    const options = {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        }
      },
      silent: true
    };
    
    await exec.exec('howmany', ['--version'], options);
    
    // Extract version from output (format: "howmany 0.3.2")
    const match = output.match(/howmany (\d+\.\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  }
} 