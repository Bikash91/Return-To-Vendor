sap.ui.define([
	"sap/m/Input"
], function (Input) {
	"use strict";

	return Input.extend("com.sap.upl.ReturnToVendor.controller.CustomInput", {
		renderer: {},
		onAfterRendering: function () {
			if (sap.m.Input.prototype.onAfterRendering) {
				sap.m.Input.prototype.onAfterRendering.apply(this, arguments);
			}
			this.$().find('INPUT').keypress(function () {
				if (event.keyCode === 13) {
					this.fireChange({});
				}
			}.bind(this));
		}
	});
});