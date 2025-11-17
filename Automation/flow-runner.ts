#!/usr/bin/env ts-node

/**
 * Flow Runner for Smooth Operators Automation Suite
 * Executes tests in proper flow sequence with dependency management
 */

import { execSync, spawn } from 'child_process';
import { TEST_FLOWS, validateFlowDependencies, getExecutionOrder } from './test-flows.config';

interface RunnerOptions {
  ui?: boolean;
  headed?: boolean;
  debug?: boolean;
  verbose?: boolean;
  project?: string;
  grep?: string;
}

class FlowRunner {
  private options: RunnerOptions;

  constructor(options: RunnerOptions = {}) {
    this.options = options;
  }

  /**
   * Validate flow configuration
   */
  validateFlows(): boolean {
    console.log('🔍 Validating test flow configuration...');

    const validation = validateFlowDependencies();
    if (!validation.valid) {
      console.error('❌ Flow validation failed:');
      validation.errors.forEach(error => console.error(`   ${error}`));
      return false;
    }

    console.log('✅ Flow configuration is valid');
    return true;
  }

  /**
   * Execute a single flow
   */
  async executeFlow(flowName: string): Promise<boolean> {
    const flow = TEST_FLOWS.find(f => f.name === flowName);
    if (!flow) {
      console.error(`❌ Flow "${flowName}" not found`);
      return false;
    }

    console.log(`\n🎯 Executing flow: ${flow.name}`);
    console.log(`📝 Description: ${flow.description}`);
    console.log(`📋 Tests: ${flow.tests.join(', ')}`);

    const command = this.buildCommand(flow.tests);
    console.log(`🚀 Running: ${command}`);

    try {
      if (this.options.debug) {
        // For debug mode, run interactively
        return await this.runInteractive(command);
      } else {
        // For regular execution, run synchronously
        execSync(command, {
          stdio: 'inherit',
          cwd: process.cwd()
        });
        return true;
      }
    } catch (error) {
      console.error(`❌ Flow "${flowName}" failed:`, error.message);
      return false;
    }
  }

  /**
   * Execute all flows in dependency order
   */
  async executeAllFlows(): Promise<boolean> {
    const executionOrder = getExecutionOrder();

    console.log('📊 Execution Order:');
    executionOrder.forEach((flow, index) => {
      console.log(`   ${index + 1}. ${flow.name} (${flow.tests.length} tests)`);
    });

    let success = true;
    for (const flow of executionOrder) {
      const flowSuccess = await this.executeFlow(flow.name);
      if (!flowSuccess) {
        success = false;
        if (!this.options.verbose) {
          console.log('🛑 Stopping execution due to failure. Use --verbose to continue on errors.');
          break;
        }
      }
    }

    return success;
  }

  /**
   * Execute specific project
   */
  async executeProject(projectName: string): Promise<boolean> {
    console.log(`🎯 Executing project: ${projectName}`);

    const command = this.buildCommand([], projectName);
    console.log(`🚀 Running: ${command}`);

    try {
      if (this.options.debug) {
        return await this.runInteractive(command);
      } else {
        execSync(command, {
          stdio: 'inherit',
          cwd: process.cwd()
        });
        return true;
      }
    } catch (error) {
      console.error(`❌ Project "${projectName}" failed:`, error.message);
      return false;
    }
  }

  /**
   * Build Playwright command
   */
  private buildCommand(testFiles: string[] = [], project?: string): string {
    let command = 'npx playwright test';

    // Add test files
    if (testFiles.length > 0) {
      command += ` ${testFiles.join(' ')}`;
    }

    // Add project
    if (project) {
      command += ` --project=${project}`;
    }

    // Add grep filter
    if (this.options.grep) {
      command += ` --grep="${this.options.grep}"`;
    }

    // Add UI mode
    if (this.options.ui) {
      command += ' --ui';
    }

    // Add headed mode
    if (this.options.headed) {
      command += ' --headed';
    }

    // Add debug mode
    if (this.options.debug) {
      command += ' --debug';
    }

    return command;
  }

  /**
   * Run command interactively (for debug mode)
   */
  private async runInteractive(command: string): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn(command, {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });

      child.on('error', (error) => {
        console.error('Command execution failed:', error);
        resolve(false);
      });
    });
  }

  /**
   * Show available flows
   */
  showFlows(): void {
    console.log('📋 Available Test Flows:');
    console.log('='.repeat(50));

    TEST_FLOWS.forEach(flow => {
      console.log(`\n🎯 ${flow.name}`);
      console.log(`   ${flow.description}`);
      console.log(`   Tests: ${flow.tests.join(', ')}`);
      console.log(`   Dependencies: ${flow.dependencies.join(', ') || 'None'}`);
      console.log(`   Parallel: ${flow.parallel ? 'Yes' : 'No'}`);
    });

    console.log('\n📊 Execution Order:');
    const executionOrder = getExecutionOrder();
    executionOrder.forEach((flow, index) => {
      console.log(`   ${index + 1}. ${flow.name}`);
    });
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const options: RunnerOptions = {};

  // Parse command line arguments
  let flowName: string | undefined;
  let projectName: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--ui':
        options.ui = true;
        break;
      case '--headed':
        options.headed = true;
        break;
      case '--debug':
        options.debug = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--grep':
        options.grep = args[++i];
        break;
      case '--project':
        projectName = args[++i];
        break;
      case '--flow':
        flowName = args[++i];
        break;
      case '--list':
        new FlowRunner().showFlows();
        return;
      case '--help':
        showHelp();
        return;
      default:
        if (!flowName && !arg.startsWith('--')) {
          flowName = arg;
        }
        break;
    }
  }

  const runner = new FlowRunner(options);

  // Validate configuration
  if (!runner.validateFlows()) {
    process.exit(1);
  }

  let success = false;

  try {
    if (projectName) {
      // Execute specific project
      success = await runner.executeProject(projectName);
    } else if (flowName) {
      // Execute specific flow
      success = await runner.executeFlow(flowName);
    } else {
      // Execute all flows
      console.log('🚀 Starting full flow execution...');
      success = await runner.executeAllFlows();
    }

    if (success) {
      console.log('\n🎉 All flows executed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some flows failed during execution');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Execution failed with error:', error.message);
    process.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(`
🎯 Smooth Operators Flow Runner

USAGE:
  ts-node flow-runner.ts [options] [flow-name]

OPTIONS:
  --flow <name>     Execute specific flow
  --project <name>  Execute specific project
  --ui              Run in UI mode
  --headed          Run with browser visible
  --debug           Run in debug mode
  --verbose         Continue on errors
  --grep <pattern>  Filter tests by pattern
  --list            Show available flows
  --help            Show this help

EXAMPLES:
  ts-node flow-runner.ts                    # Execute all flows
  ts-node flow-runner.ts --flow products    # Execute products flow
  ts-node flow-runner.ts --project setup    # Execute setup project
  ts-node flow-runner.ts --ui               # Execute all flows in UI mode
  ts-node flow-runner.ts --grep "TC1:"      # Execute only smoke tests

AVAILABLE FLOWS:
  setup, authentication, dealership-configuration, finance-providers,
  products-configuration, api-integrations, dms-integration, review-submit
`);
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { FlowRunner, RunnerOptions };
