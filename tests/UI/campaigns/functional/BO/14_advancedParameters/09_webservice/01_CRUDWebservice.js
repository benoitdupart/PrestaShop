/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */
require('module-alias/register');

const {expect} = require('chai');

// Import utils
const helper = require('@utils/helpers');
const loginCommon = require('@commonTests/loginBO');

// Import pages
const LoginPage = require('@pages/BO/login/index');
const DashboardPage = require('@pages/BO/dashboard/index');
const WebservicePage = require('@pages/BO/advancedParameters/webservice');
const AddWebservicePage = require('@pages/BO/advancedParameters/webservice/add');

// Import data
const WebserviceFaker = require('@data/faker/webservice');

// Import test context
const testContext = require('@utils/testContext');

const baseContext = 'functional_BO_modules_advancedParameters_webservice_CRUDWebservice';

let browserContext;
let page;

let numberOfWebserviceKeys = 0;

const createWebserviceData = new WebserviceFaker({});
const editWebserviceData = new WebserviceFaker({});

// Init objects needed
const init = async function () {
  return {
    loginPage: new LoginPage(page),
    dashboardPage: new DashboardPage(page),
    webservicePage: new WebservicePage(page),
    addWebservicePage: new AddWebservicePage(page),
  };
};

// Create, Read, Update and Delete webservice key in BO
describe('Create, Read, Update and Delete webservice key in BO', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);

    this.pageObjects = await init();
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  // Login from BO and go to "Advanced parameters > Webservice" page
  loginCommon.loginBO();

  it('should go to "Advanced parameters > Webservice" page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToWebservicePage', baseContext);

    await this.pageObjects.dashboardPage.goToSubMenu(
      this.pageObjects.dashboardPage.advancedParametersLink,
      this.pageObjects.dashboardPage.webserviceLink,
    );

    await this.pageObjects.webservicePage.closeSfToolBar();

    const pageTitle = await this.pageObjects.webservicePage.getPageTitle();
    await expect(pageTitle).to.contains(this.pageObjects.webservicePage.pageTitle);
  });

  it('should reset all filters and get number of webservices', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'firstReset', baseContext);

    numberOfWebserviceKeys = await this.pageObjects.webservicePage.resetAndGetNumberOfLines();
    if (numberOfWebserviceKeys !== 0) await expect(numberOfWebserviceKeys).to.be.above(0);
  });

  // 1 : Create webservice key
  describe('Create webservice key', async () => {
    it('should go to add new webservice key page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAddNewWebserviceKeyPage', baseContext);

      await this.pageObjects.webservicePage.goToAddNewWebserviceKeyPage();
      const pageTitle = await this.pageObjects.addWebservicePage.getPageTitle();
      await expect(pageTitle).to.contains(this.pageObjects.addWebservicePage.pageTitleCreate);
    });

    it('should create webservice key and check result', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createWebserviceKey', baseContext);

      const textResult = await this.pageObjects.addWebservicePage.createEditWebservice(createWebserviceData);
      await expect(textResult).to.equal(this.pageObjects.addWebservicePage.successfulCreationMessage);

      const numberOfWebserviceKeysAfterCreation = await this.pageObjects.webservicePage.getNumberOfElementInGrid();
      await expect(numberOfWebserviceKeysAfterCreation).to.be.equal(numberOfWebserviceKeys + 1);
    });
  });

  // 2 : Update webservice key
  describe('Update the webservice key created', async () => {
    it('should filter list by key description', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterAfterUpdate', baseContext);

      await this.pageObjects.webservicePage.filterWebserviceTable(
        'input',
        'description',
        createWebserviceData.keyDescription,
      );

      const key = await this.pageObjects.webservicePage.getTextColumnFromTable(1, 'description');
      await expect(key).to.contains(createWebserviceData.keyDescription);
    });

    it('should go to edit webservice page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToEditWebservicePage', baseContext);

      await this.pageObjects.webservicePage.goToEditWebservicePage(1);
      const pageTitle = await this.pageObjects.addWebservicePage.getPageTitle();
      await expect(pageTitle).to.contains(this.pageObjects.addWebservicePage.pageTitleEdit);
    });

    it('should update the webservice key and check result', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'updateWebserviceKey', baseContext);

      const textResult = await this.pageObjects.addWebservicePage.createEditWebservice(editWebserviceData);
      await expect(textResult).to.equal(this.pageObjects.addWebservicePage.successfulUpdateMessage);
    });

    it('should reset filter and check the number of webservice keys', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterAfterUpdate', baseContext);
      const numberOfWebserviceKeyAfterDelete = await this.pageObjects.webservicePage.resetAndGetNumberOfLines();
      await expect(numberOfWebserviceKeyAfterDelete).to.be.equal(numberOfWebserviceKeys + 1);
    });
  });

  // 3 : Delete webservice key
  describe('Delete webservice key', async () => {
    it('should filter list by key description', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterBeforeDelete', baseContext);

      await this.pageObjects.webservicePage.filterWebserviceTable(
        'input',
        'description',
        editWebserviceData.keyDescription,
      );

      const key = await this.pageObjects.webservicePage.getTextColumnFromTable(1, 'description');
      await expect(key).to.contains(editWebserviceData.keyDescription);
    });

    it('should delete webservice key', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'deleteWebserviceKey', baseContext);

      const textResult = await this.pageObjects.webservicePage.deleteWebserviceKey(1);
      await expect(textResult).to.equal(this.pageObjects.webservicePage.successfulDeleteMessage);
    });

    it('should reset filter and check the number of webservice keys', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterAfterDelete', baseContext);

      const numberOfWebserviceKeyAfterDelete = await this.pageObjects.webservicePage.resetAndGetNumberOfLines();
      await expect(numberOfWebserviceKeyAfterDelete).to.be.equal(numberOfWebserviceKeys);
    });
  });
});
