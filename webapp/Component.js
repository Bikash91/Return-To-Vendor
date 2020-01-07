sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/sap/upl/ReturnToVendor/model/models",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("com.sap.upl.ReturnToVendor.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			var oModel = new JSONModel({
				busy: false,
				enablePost: false,
				showBatch: false,
				GS1Visible: false,
				gsPropertyenable: true,
				GS1Value: ""
			});
			this.setModel(oModel, "settingsModel");
			this.getModel("settingsModel").refresh();
			this.getModel("settingsModel").updateBindings();

			var vendorData = new JSONModel({
				WHNUMBER: "",
				MDNUMBER: "",
				TRNUMBER: "",
				PONUMBER: "",
				NAVMDHEADERTOITEM: []
			});
			this.setModel(vendorData, "vendorModel");
			this.getModel("vendorModel").refresh();
			this.getModel("vendorModel").updateBindings();

			var lineitemData = new JSONModel({
				MDNUMBER: "",
				ITEMNO: "",
				MATERIALNO: "",
				BATCH: "",
				QUANTITY: "",
				UNIT: "",
				SOURCEBIN: ""
			});
			this.setModel(lineitemData, "lineitemData");
			this.getModel("lineitemData").refresh();
			this.getModel("lineitemData").updateBindings();

			var tableData = new JSONModel({
				NAVMDHEADERTOITEM: []
			});

			this.setModel(tableData, "tableData");
			this.getModel("tableData").refresh();
			this.getModel("tableData").updateBindings();

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});