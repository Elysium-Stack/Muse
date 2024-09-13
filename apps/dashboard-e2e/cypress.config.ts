import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
	// eslint-disable-next-line unicorn/prefer-module
	e2e: nxE2EPreset(__dirname),
});
