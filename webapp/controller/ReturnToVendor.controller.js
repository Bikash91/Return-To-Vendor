sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (Controller, MessageBox, JSONModel, Device) {
	"use strict";

	return Controller.extend("com.sap.upl.ReturnToVendor.controller.ReturnToVendor", {

		onInit: function () {
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("material").focus();
			});
			this.path = "/sap/fiori/zreturntovendor/" + this.getOwnerComponent().getModel("soundModel").sServiceUrl +
				"/SoundFileSet('sapmsg1.mp3')/$value";
		},

		onAfterRendering: function () {
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("material").focus();
			});
			this.path = "/sap/fiori/zreturntovendor/" + this.getOwnerComponent().getModel("soundModel").sServiceUrl +
				"/SoundFileSet('sapmsg1.mp3')/$value";
		},

		handleValueHelpRequest: function (oEvent) {
			this.sInputValue = oEvent.getSource();
			this.inputIdMat = oEvent.getSource().getId().split("--")[1];
			var oPath = oEvent.getSource().getBindingInfo("suggestionItems").path;
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"com.sap.upl.ReturnToVendor.fragments.SearchHelp",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}
			this._setListBinding(oPath, this.inputIdMat);
			this._valueHelpDialog.open();
		},

		_setListBinding: function (oPath, idInput) {

			switch (idInput) {
			case "sourceBin":
				this.id = "sourceBin";
				this.title = "SOURCEBIN";
				this.desc = "WHNUMBER";
				this.text = "Source Bin";
				break;
			default:
				return;
			}
			var oTemplate = new sap.m.StandardListItem({
				title: "{" + this.title + "}",
				description: "{" + this.desc + "}"
			});

			var aTempFlter = [];
			aTempFlter.push(new sap.ui.model.Filter([
					new sap.ui.model.Filter("WHNUMBER", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("vendorModel").getProperty(
						"/WHNUMBER"))
				],
				true));
			this._valueHelpDialog.bindAggregation("items", oPath, oTemplate);
			this._valueHelpDialog.getBinding("items").filter(aTempFlter);

			this._valueHelpDialog.setTitle(this.text);
		},

		onOk: function (oEvent) {
			debugger;
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this.sKey = oSelectedItem.getTitle();
				if (this.id === "sourceBin") {
					this.getOwnerComponent().getModel("lineitemData").setProperty(
						"/SOURCEBIN", this.sKey);
				}
			}

			var MDNUMBER = this.getOwnerComponent().getModel("vendorModel").getProperty(
				"/MDNUMBER");
			var WHNUMBER = this.getOwnerComponent().getModel("vendorModel").getProperty(
				"/WHNUMBER");
			var MATERIALNO = this.getOwnerComponent().getModel("lineitemData").getProperty(
				"/MATERIALNO");
			var BATCH = this.getOwnerComponent().getModel("lineitemData").getProperty(
				"/BATCH");
			var QUANTITY = this.getOwnerComponent().getModel("lineitemData").getProperty(
				"/QUANTITY");
			var SOURCEBIN = this.getOwnerComponent().getModel("lineitemData").getProperty(
				"/SOURCEBIN");

			if ((MDNUMBER != "" && WHNUMBER != "" && MATERIALNO != "" && QUANTITY != "" && SOURCEBIN != "") || (BATCH == "" && BATCH != "")) {
				this.checkallfield(MDNUMBER, WHNUMBER, MATERIALNO, BATCH, QUANTITY, SOURCEBIN);
			}

			this.sInputValue.setValueStateText("");
			this.sInputValue.setValueState("None");
		},

		checkallfield: function (MDNUMBER, WHNUMBER, MATERIALNO, BATCH, QUANTITY, SOURCEBIN) {
			var fieldFilter, filter = [];
			fieldFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("MDNUMBER", sap.ui.model.FilterOperator.EQ, MDNUMBER),
					new sap.ui.model.Filter("WHNUMBER", sap.ui.model.FilterOperator.EQ, WHNUMBER),
					new sap.ui.model.Filter("ITEM", sap.ui.model.FilterOperator.EQ, MATERIALNO),
					new sap.ui.model.Filter("BATCH", sap.ui.model.FilterOperator.EQ, BATCH),
					new sap.ui.model.Filter("QUANTITY", sap.ui.model.FilterOperator.EQ, QUANTITY),
					new sap.ui.model.Filter("SOURCEBIN", sap.ui.model.FilterOperator.EQ, SOURCEBIN)
				],
				and: true
			});
			filter.push(fieldFilter);
			/*var path = "/FIELDVALIDATIONSet(MDNUMBER='" + MDNUMBER + "',WHNUMBER='" + WHNUMBER + "',ITEM='" + MATERIALNO + "',BATCH='" +
				BATCH + "',SOURCEBIN='" + SOURCEBIN + "',QUANTITY='" + QUANTITY + "')";*/
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.getOwnerComponent().getModel().read("/FIELDVALIDATIONSet", {
				filters: filter,
				success: function (oData, oResponse) {
					debugger;
					var data = oData.results[0];
					var id;
					var audio = new Audio(this.path);
					if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Value") != "") {
						if (data.ERRORINDICATOR == 'E') {
							audio.play();
							jQuery.sap.delayedCall(5000, this, function () {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
								MessageBox.error(data.MESSAGE, {
									onClose: function (oAction) {
										if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
											if (data.ERRORTYPE == 'BIN') {
												this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
												id = "sourceBin";
											}
											jQuery.sap.delayedCall(400, this, function () {
												this.byId(id).focus();
											});
											this.getOwnerComponent().getModel("lineitemData").refresh();
											this.getOwnerComponent().getModel("lineitemData").updateBindings();
											this.getOwnerComponent().getModel("settingsModel").refresh();
										}
									}.bind(this)
								});
							});
						} else {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
							this.addLineItem();
						}
					} else {
						if (data.ERRORINDICATOR == 'E') {
							audio.play();
							jQuery.sap.delayedCall(5000, this, function () {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
								MessageBox.error(data.MESSAGE, {
									onClose: function (oAction) {
										if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
											if (data.ERRORTYPE == 'BIN') {
												this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
												id = "sourceBin";
											}
											jQuery.sap.delayedCall(400, this, function () {
												this.byId(id).focus();
											});
										}
									}.bind(this)
								});
							});
						} else {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
							this.addLineItem();
						}
					}
				}.bind(this),
				error: function (error) {
					debugger;
					// this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					this.getErrorDetails(error, "Error!");
				}.bind(this)
			});
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = [];
			if (sValue) {
				oFilter.push(new sap.ui.model.Filter([
						new sap.ui.model.Filter("WHNUMBER", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("vendorModel").getProperty(
							"/WHNUMBER")),
						new sap.ui.model.Filter(this.title, sap.ui.model.FilterOperator.Contains, sValue)
					],
					true));
				evt.getSource().getBinding("items").filter(oFilter);
			} else {
				oFilter.push(new sap.ui.model.Filter([
						new sap.ui.model.Filter("WHNUMBER", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("vendorModel").getProperty(
							"/WHNUMBER"))
					],
					true));
				evt.getSource().getBinding("items").filter(oFilter);
			}

		},

		onChange: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}

			if (oEvt.getSource().getName() == "MaterialNo") {
				if (this.byId("material").getValue() != "") {
					this.onGettingVendorItem(oEvt);
				}
			} else if (oEvt.getSource().getName() == "ItemCode") {
				if (this.byId("itemCode").getValue() != "") {
					this.onCheckItemCode(this.byId("itemCode").getValue());
				}
			} else if (oEvt.getSource().getName() == "Batch") {
				if (this.byId("batch").getValue() != "") {
					this.onCheckBatch(oEvt.getSource().getValue());
				}
			} else if (oEvt.getSource().getName() == "GS1") {
				if (this.byId("gs1").getValue() != "") {
					var qrData = oEvt.getSource().getValue();
					if (oEvt.getSource().getValue() != "") {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", oEvt.getSource().getValue());
						// qrData = qrData.split("(").join("/").split(")").join("/").split("/");
						qrData = qrData.split("(").join("-:-").split(")").join("-:-").split("-:-");
						var obj = {
							"241": "",
							"240": "",
							"30": "",
							"10": ""
						};
						for (var i = 0; i < qrData.length; i++) {
							if (qrData[i] == '241') {
								obj["241"] = qrData[i + 1];
							} else if (qrData[i] == '240') {
								obj["240"] = qrData[i + 1];
							} else if (qrData[i] == '30') {
								obj["30"] = qrData[i + 1];
							} else if (qrData[i] == '10' && qrData[i - 2] == '30') {
								if (qrData[i + 1] == undefined) {
									obj["10"] = "";
								} else {
									obj["10"] = qrData[i + 1];
								}
							}
						}
						if (obj["241"] == "" || obj["30"] == "") {
							jQuery.sap.delayedCall(400, this, function () {
								//MessageBox.error("Invalid QR Code!");
								MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("invalidQRCode"), {
									icon: MessageBox.Icon.ERROR,
									title: "Error",
									contentWidth: "100px",
									onClose: function (oAction) {
										if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
											this.byId("gs1").focus();
											this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
											this.getOwnerComponent().getModel("settingsModel").refresh();
										}
									}.bind(this)
								});
							});
							return;
						}
						this.QRmaterial = obj["241"];
						this.QRquantity = obj["30"];
						this.QRmatDes = obj["240"];
						this.QRbatch = obj["10"];

						this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", this.QRmaterial);
						this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", this.QRbatch);
						// this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", this.QRquantity);
						// this.getOwnerComponent().getModel("lineitemData").setProperty("/MAKTX", this.QRmatDes);
						this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", false);
						this.getOwnerComponent().getModel("lineitemData").refresh();
						this.getOwnerComponent().getModel("lineitemData").updateBindings();
						this.onCheckItemCode(this.QRmaterial);
					} else {
						this.QRmaterial = "";
						this.QRquantity = "";
						this.QRmatDes = "";
						this.QRbatch = "";
						this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", oEvt.getSource().getValue());
						this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", "");
						this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
						this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
						// this.getOwnerComponent().getModel("lineitemData").setProperty("/MAKTX", "");
						this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
						this.getOwnerComponent().getModel("lineitemData").refresh();
						this.getOwnerComponent().getModel("lineitemData").updateBindings();
					}

				}
			} else if (oEvt.getSource().getName() == "SourceBin") {
				if (this.byId("sourceBin").getValue() != "") {
					this.addSourceBin(oEvt);
				}
			}

			var MDNUMBER = this.getOwnerComponent().getModel("vendorModel").getProperty(
				"/MDNUMBER");
			var WHNUMBER = this.getOwnerComponent().getModel("vendorModel").getProperty(
				"/WHNUMBER");
			var MATERIALNO = this.getOwnerComponent().getModel("lineitemData").getProperty(
				"/MATERIALNO");
			var BATCH = this.getOwnerComponent().getModel("lineitemData").getProperty(
				"/BATCH");
			var QUANTITY = this.getOwnerComponent().getModel("lineitemData").getProperty(
				"/QUANTITY");
			var SOURCEBIN = this.getOwnerComponent().getModel("lineitemData").getProperty(
				"/SOURCEBIN");

			if ((MDNUMBER != "" && WHNUMBER != "" && MATERIALNO != "" && QUANTITY != "" && SOURCEBIN != "") || (BATCH == "" && BATCH != "")) {
				this.checkallfield(MDNUMBER, WHNUMBER, MATERIALNO, BATCH, QUANTITY, SOURCEBIN);
			}
		},
		onDeleteLineItem: function (oEvent) {
			this.getView().getModel("tableData").getProperty("/NAVMDHEADERTOITEM").splice(oEvent.getSource().getId().split("-")[oEvent.getSource()
				.getId().split("-").length - 1], 1);
			this.getView().getModel("tableData").refresh();

			jQuery.sap.delayedCall(400, this, function () {
				this.byId("itemCode").focus();
			});

			if (this.getOwnerComponent().getModel("tableData").getProperty("/NAVMDHEADERTOITEM").length > 0) {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
				this.byId("tableData").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items") + " (" + this.getOwnerComponent()
					.getModel("tableData").getProperty("/NAVMDHEADERTOITEM").length + ")");
			} else {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
				this.byId("tableData").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items"));
			}
		},

		onGettingVendorItem: function (oEvt) {
			if (oEvt.getSource().getValue() == "") {
				oEvt.getSource().setValueState("Error");
				oEvt.getSource().setValueStateText("Please provide Material Number.");
				this.getOwnerComponent().getModel("lineitemData").setProperty("/ITEMNO", "");
				this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", "");
				this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
				this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
				this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
				this.getOwnerComponent().getModel("lineitemData").setProperty("/UNIT", "");
				this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
				this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);

				this.getOwnerComponent().getModel("lineitemData").refresh();
				this.getOwnerComponent().getModel("lineitemData").updateBindings();
				var audio = new Audio(this.path);
				audio.play();
				this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
				jQuery.sap.delayedCall(5000, this, function () {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("providemat"), {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						contentWidth: "100px",
						onClose: function (oAction) {
							if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
								jQuery.sap.delayedCall(400, this, function () {
									this.byId("material").focus();
								});
							}
						}.bind(this)
					});
				});
				return;
			} else if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}

			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			var path = "/MDHEADERSet('" + oEvt.getSource().getValue() + "')";
			this.getOwnerComponent().getModel().read(path, {
				urlParameters: {
					$expand: 'NAVMDHEADERTOITEM'
				},
				success: function (oData, oResponse) {
					if (oData.NAVMDHEADERTOITEM.results.length > 0) {
						for (var i = 0; i < oData.NAVMDHEADERTOITEM.results.length; i++) {
							oData.NAVMDHEADERTOITEM.results[i].QUANTITY = oData.NAVMDHEADERTOITEM.results[i].QUANTITY.trim();
						}
					}
					this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
					this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);

					if (oData.WHNUMBER == "NOG") {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Visible", false);
						jQuery.sap.delayedCall(400, this, function () {
							this.byId("itemCode").focus();

						});
					} else {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Visible", true);
						jQuery.sap.delayedCall(400, this, function () {
							this.byId("gs1").focus();
						});
					}

					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					this.getOwnerComponent().getModel("vendorModel").setProperty("/MDNUMBER", oData.MDNUMBER);
					this.getOwnerComponent().getModel("vendorModel").setProperty("/PONUMBER", oData.PONUMBER);
					this.getOwnerComponent().getModel("vendorModel").setProperty("/TRNUMBER", oData.TRNUMBER);
					this.getOwnerComponent().getModel("vendorModel").setProperty("/WHNUMBER", oData.WHNUMBER);
					this.getOwnerComponent().getModel("vendorModel").setProperty("/NAVMDHEADERTOITEM", oData.NAVMDHEADERTOITEM.results);
					this.getOwnerComponent().getModel("vendorModel").refresh();
					this.getOwnerComponent().getModel("vendorModel").updateBindings();

					this.getOwnerComponent().getModel("lineitemData").setProperty("/ITEMNO", "");
					this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", "");
					this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
					this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
					this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
					this.getOwnerComponent().getModel("lineitemData").setProperty("/UNIT", "");
					this.getOwnerComponent().getModel("lineitemData").refresh();
					this.getOwnerComponent().getModel("lineitemData").updateBindings();

					var tableData = new JSONModel({
						NAVMDHEADERTOITEM: []
					});

					this.getOwnerComponent().setModel(tableData, "tableData");
					this.getOwnerComponent().getModel("tableData").refresh();
					this.getOwnerComponent().getModel("tableData").updateBindings();

				}.bind(this),
				error: function (error) {
					jQuery.sap.delayedCall(5000, this, function () {
						this.byId("material").focus();
						this.getOwnerComponent().getModel("vendorModel").setProperty("/MDNUMBER", "");
						this.getOwnerComponent().getModel("vendorModel").setProperty("/PONUMBER", "");
						this.getOwnerComponent().getModel("vendorModel").setProperty("/TRNUMBER", "");
						this.getOwnerComponent().getModel("vendorModel").setProperty("/WHNUMBER", "");
						this.getOwnerComponent().getModel("vendorModel").setProperty("/NAVMDHEADERTOITEM", []);
						this.getOwnerComponent().getModel("vendorModel").refresh();
						this.getOwnerComponent().getModel("vendorModel").updateBindings();

						this.getOwnerComponent().getModel("lineitemData").setProperty("/ITEMNO", "");
						this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", "");
						this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
						this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
						this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
						this.getOwnerComponent().getModel("lineitemData").setProperty("/UNIT", "");
						this.getOwnerComponent().getModel("lineitemData").setProperty("/NAVMDHEADERTOITEM", []);

						this.getOwnerComponent().getModel("lineitemData").refresh();
						this.getOwnerComponent().getModel("lineitemData").updateBindings();

						jQuery.sap.delayedCall(400, this, function () {
							this.byId("material").focus();
						});
					});
					this.getErrorDetails(error, this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unablegetVendor"));
				}.bind(this)
			});
		},

		addQuantity: function (oEvt) {

			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
				jQuery.sap.delayedCall(400, this, function () {
					this.byId("sourceBin").focus();
				});
				this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", oEvt.getSource().getValue());
			} else {
				this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
				this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
			}
		},
		onCheckItemCode: function (value) {
			debugger;
			var exactLineItem = 0;
			var isItemExist = false;
			if (value != "") {
				this.byId("itemCode").setValueState("None");
				for (var i = 0; i < this.getOwnerComponent().getModel("vendorModel").getProperty("/NAVMDHEADERTOITEM").length; i++) {
					if (value == this.getOwnerComponent().getModel("vendorModel").getProperty("/NAVMDHEADERTOITEM")[i].MATERIALNO) {
						isItemExist = true;
						exactLineItem = i;
						break;
					}
				}
			}

			if (isItemExist == false) {
				var audio = new Audio(this.path);
				audio.play();
				this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
				if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Value") != "") {
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("itemNotExist"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("gs1").focus();
										this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
										this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
										this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/ITEMNO", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/UNIT", "");
									});
								}
							}.bind(this)
						});
					});
				} else {
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("itemNotExist"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("itemCode").focus();
										this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
										this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
										this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/ITEMNO", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/UNIT", "");
									});
								}
							}.bind(this)
						});
					});
					return;
				}
			} else {
				if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Value") != "") {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", false);
					this.getOwnerComponent().getModel("lineitemData").setProperty("/ITEMNO", this.getOwnerComponent().getModel("vendorModel").getProperty(
						"/NAVMDHEADERTOITEM")[exactLineItem].ITEMNO);
					this.getOwnerComponent().getModel("lineitemData").setProperty("/UNIT", this.getOwnerComponent().getModel("vendorModel").getProperty(
						"/NAVMDHEADERTOITEM")[exactLineItem].UNIT);
					this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", this.QRbatch);
					this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", this.getOwnerComponent().getModel("vendorModel").getProperty(
						"/NAVMDHEADERTOITEM")[exactLineItem].QUANTITY);
					this.getOwnerComponent().getModel("lineitemData").refresh();
					this.getOwnerComponent().getModel("lineitemData").updateBindings();

					if (value != "") {
						for (var i = 0; i < this.getOwnerComponent().getModel("vendorModel").getProperty("/NAVMDHEADERTOITEM").length; i++) {
							if (this.getOwnerComponent().getModel("lineitemData").getProperty("/MATERIALNO") == this.getOwnerComponent().getModel(
									"vendorModel").getProperty("/NAVMDHEADERTOITEM")[i].MATERIALNO) {

								this.vendorbatch = this.getOwnerComponent().getModel("vendorModel").getProperty(
									"/NAVMDHEADERTOITEM")[i].BATCH;
							}
						}
					}
					if (this.vendorbatch != "" && this.QRbatch == "") {
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("matnotbatchManaged"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
									this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
									this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
									this.getOwnerComponent().getModel("lineitemData").setProperty("/ITEMNO", "");
									this.getOwnerComponent().getModel("lineitemData").setProperty("/UNIT", "");
									this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
									this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
									this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", "");
									this.getOwnerComponent().getModel("lineitemData").refresh();
									this.getOwnerComponent().getModel("lineitemData").updateBindings();
									jQuery.sap.delayedCall(200, this, function () {
										this.byId("gs1").focus();
									});
								}
							}.bind(this)
						});
						return;
					} else if (this.vendorbatch == "" && this.QRbatch != "") {
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("matisbatchmanaged"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
									this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
									this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
									this.getOwnerComponent().getModel("lineitemData").setProperty("/ITEMNO", "");
									this.getOwnerComponent().getModel("lineitemData").setProperty("/UNIT", "");
									this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
									this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
									this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", "");
									this.getOwnerComponent().getModel("lineitemData").refresh();
									this.getOwnerComponent().getModel("lineitemData").updateBindings();
									jQuery.sap.delayedCall(200, this, function () {
										this.byId("gs1").focus();
									});
								}
							}.bind(this)
						});
						return;
					} else {
						if (this.QRbatch != "") {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", true);
							this.onCheckBatch(this.QRbatch);
						} else {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
							jQuery.sap.delayedCall(200, this, function () {
								this.byId("sourceBin").focus();
							});
						}
						/*jQuery.sap.delayedCall(200, this, function () {
							this.byId("sourceBin").focus();
						});*/
					}
					// 
				} else {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", false);
					this.getOwnerComponent().getModel("lineitemData").setProperty("/ITEMNO", this.getOwnerComponent().getModel("vendorModel").getProperty(
						"/NAVMDHEADERTOITEM")[exactLineItem].ITEMNO);
					this.getOwnerComponent().getModel("lineitemData").setProperty("/UNIT", this.getOwnerComponent().getModel("vendorModel").getProperty(
						"/NAVMDHEADERTOITEM")[exactLineItem].UNIT);
					this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", this.getOwnerComponent().getModel("vendorModel").getProperty(
						"/NAVMDHEADERTOITEM")[exactLineItem].BATCH);
					this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", this.getOwnerComponent().getModel("vendorModel").getProperty(
						"/NAVMDHEADERTOITEM")[exactLineItem].QUANTITY);
					this.getOwnerComponent().getModel("lineitemData").refresh();
					this.getOwnerComponent().getModel("lineitemData").updateBindings();
					if (this.getOwnerComponent().getModel("lineitemData").getProperty("/BATCH") != "") {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", true);
						jQuery.sap.delayedCall(400, this, function () {
							this.byId("sourceBin").focus();
						});
					} else {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", true);
						jQuery.sap.delayedCall(400, this, function () {
							this.byId("batch").focus();
						});
					}
				}

			}
		},

		vendorbatch: "",

		onCheckBatch: function (value) {
			debugger;
			this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", value.toUpperCase());
			var indexNumber = 0;
			var isBatchExist = false;
			if (value != "") {
				this.byId("batch").setValueState("None");
				for (var i = 0; i < this.getOwnerComponent().getModel("vendorModel").getProperty("/NAVMDHEADERTOITEM").length; i++) {
					if (this.getOwnerComponent().getModel("lineitemData").getProperty("/MATERIALNO") == this.getOwnerComponent().getModel(
							"vendorModel").getProperty("/NAVMDHEADERTOITEM")[i].MATERIALNO && value == this.getOwnerComponent().getModel(
							"vendorModel").getProperty("/NAVMDHEADERTOITEM")[i].BATCH) {
						isBatchExist = true;
						indexNumber = i;
					}
				}
			}

			if (isBatchExist == false) {
				var audio = new Audio(this.path);
				audio.play();
				this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);

				if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Value") != "") {
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("batchNotExist"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("gs1").focus();
										this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/MATERIALNO", "");
										this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
										this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
										this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
									});
								}
							}.bind(this)
						});
					});
				} else {
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("batchNotExist"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("batch").focus();
										this.getOwnerComponent().getModel("lineitemData").setProperty("/BATCH", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", "");
										this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
									});
								}
							}.bind(this)
						});
					});
				}
			} else {
				debugger;
				this.getOwnerComponent().getModel("lineitemData").setProperty("/QUANTITY", this.getOwnerComponent().getModel(
					"vendorModel").getProperty("/NAVMDHEADERTOITEM")[indexNumber].QUANTITY);
				jQuery.sap.delayedCall(400, this, function () {
					this.byId("sourceBin").focus();
				});
			}
		},

		onCheckItem: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}
		},

		/*addSourceBin: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
				this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", oEvt.getSource().getValue().toUpperCase());
				var path = "/QUANTVALIDSet(MATERIAL='" + this.getOwnerComponent().getModel("lineitemData").getProperty("/MATERIALNO") +
					"',BATCH='" + this.getOwnerComponent().getModel("lineitemData").getProperty("/BATCH") + "',SOURCEBIN='" + this.getOwnerComponent()
					.getModel("lineitemData").getProperty("/SOURCEBIN") + "',WHNUMBER='" + this.getOwnerComponent().getModel(
						"vendorModel").getProperty("/WHNUMBER") + "')";
				this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
				this.getOwnerComponent().getModel().read(path, {
					success: function (oData, oResponse) {

						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						this.availstock = parseFloat(oData.QUANTITY);
						this.addLineItem();
					}.bind(this),
					error: function (error) {
						this.getErrorDetails(error, this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unabletoAdd"));
						jQuery.sap.delayedCall(5000, this, function () {
							this.byId("sourceBin").focus();
							this.getOwnerComponent().getModel("lineitemData").setProperty("/SOURCEBIN", "");
						});
					}.bind(this)
				});
			}
		},*/

		onCheckQuan: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}
		},
		onCheckSourceBin: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}
		},

		addLineItem: function () {
			var count = this.getFormField(this.byId("returnVendor").getContent());
			if (count > 0) {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("allmandatory"));
				return;
			}

			// var QUANTITY = this.getOwnerComponent().getModel("lineitemData").getProperty("/QUANTITY");
			var MATERIALNO = this.getOwnerComponent().getModel("lineitemData").getProperty("/MATERIALNO");
			// var SOURCEBIN = this.getOwnerComponent().getModel("lineitemData").getProperty("/SOURCEBIN");
			var tableData = this.getOwnerComponent().getModel("tableData").getProperty("/NAVMDHEADERTOITEM");
			var isMaterialExist = false;
			var lineitemData = null;

			if (tableData.length === 0) {
				this.getOwnerComponent().getModel("tableData").getData().NAVMDHEADERTOITEM.push(this.getOwnerComponent().getModel(
					"lineitemData").getData());
				lineitemData = new JSONModel({
					MDNUMBER: "",
					ITEMNO: "",
					MATERIALNO: "",
					BATCH: "",
					QUANTITY: "",
					UNIT: "",
					SOURCEBIN: ""
				});
				this.getOwnerComponent().setModel(lineitemData, "lineitemData");
				this.getOwnerComponent().getModel("lineitemData").refresh();
				this.getOwnerComponent().getModel("lineitemData").updateBindings();
				if (this.getOwnerComponent().getModel("tableData").getProperty("/NAVMDHEADERTOITEM").length > 0) {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
					this.byId("tableData").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items") + " (" + this.getOwnerComponent()
						.getModel("tableData").getProperty("/NAVMDHEADERTOITEM").length + ")");
				} else {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
					this.byId("tableData").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items"));
				}

				this.getOwnerComponent().getModel("tableData").refresh();
				this.getOwnerComponent().getModel("tableData").updateBindings();

				this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
				// this.getOwnerComponent().getModel("settingsModel").setProperty("/poquan", "");

				if (this.getOwnerComponent().getModel(
						"settingsModel").getProperty("/GS1Visible")) {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
					this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
					jQuery.sap.delayedCall(200, this, function () {
						this.byId("gs1").focus();
					});
				} else {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
					jQuery.sap.delayedCall(200, this, function () {
						this.byId("itemCode").focus();
					});
				}

			} else {
				for (var k = 0; k < tableData.length; k++) {
					if (MATERIALNO == tableData[k].MATERIALNO) {
						isMaterialExist = true;
						break;
					}
				}

				if (isMaterialExist) {
					var audio = new Audio(this.path);
					audio.play();
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(
							this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("matExist"), {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								contentWidth: "100px",
								onClose: function (oAction) {
									if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
										lineitemData = new JSONModel({
											MDNUMBER: "",
											ITEMNO: "",
											MATERIALNO: "",
											BATCH: "",
											QUANTITY: "",
											UNIT: "",
											SOURCEBIN: ""
										});
										this.getOwnerComponent().setModel(lineitemData, "lineitemData");
										this.getOwnerComponent().getModel("lineitemData").refresh();
										this.getOwnerComponent().getModel("lineitemData").updateBindings();
										this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
										// this.getOwnerComponent().getModel("settingsModel").setProperty("/poquan", "");

										if (this.getOwnerComponent().getModel(
												"settingsModel").getProperty("/GS1Visible")) {
											this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
											this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
											jQuery.sap.delayedCall(200, this, function () {
												this.byId("gs1").focus();
											});
										} else {
											this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
											jQuery.sap.delayedCall(200, this, function () {
												this.byId("itemCode").focus();
											});
										}
										this.getOwnerComponent().getModel("tableData").refresh();
										this.getOwnerComponent().getModel("tableData").updateBindings();
									}
								}.bind(this)
							});
						return;
					});
				} else {
					this.getOwnerComponent().getModel("tableData").getData().NAVMDHEADERTOITEM.push(this.getOwnerComponent().getModel(
						"lineitemData").getData());
					lineitemData = new JSONModel({
						MDNUMBER: "",
						ITEMNO: "",
						MATERIALNO: "",
						BATCH: "",
						QUANTITY: "",
						UNIT: "",
						SOURCEBIN: ""
					});
					this.getOwnerComponent().setModel(lineitemData, "lineitemData");
					this.getOwnerComponent().getModel("lineitemData").refresh();
					this.getOwnerComponent().getModel("lineitemData").updateBindings();

					if (this.getOwnerComponent().getModel("tableData").getProperty("/NAVMDHEADERTOITEM").length > 0) {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
						this.byId("tableData").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items") + " (" + this.getOwnerComponent()
							.getModel("tableData").getProperty("/NAVMDHEADERTOITEM").length + ")");
					} else {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
						this.byId("tableData").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items"));
					}

					this.getOwnerComponent().getModel("tableData").refresh();
					this.getOwnerComponent().getModel("tableData").updateBindings();

					this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
					// this.getOwnerComponent().getModel("settingsModel").setProperty("/poquan", "");

					if (this.getOwnerComponent().getModel(
							"settingsModel").getProperty("/GS1Visible")) {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
						this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
						jQuery.sap.delayedCall(200, this, function () {
							this.byId("gs1").focus();
						});
					} else {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
						jQuery.sap.delayedCall(200, this, function () {
							this.byId("itemCode").focus();
						});
					}

				}
			}

			if (this.getOwnerComponent().getModel("tableData").getProperty("/NAVMDHEADERTOITEM").length > 0) {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
			} else {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
			}

		},

		onPressPost: function () {

			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			var sData = {
				"TRNUMBER": this.getOwnerComponent().getModel("vendorModel").getProperty("/TRNUMBER"),
				"WHNUMBER": this.getOwnerComponent().getModel("vendorModel").getProperty("/WHNUMBER"),
				"NAVVRHEADERTOITEM": []
			};

			sData.NAVVRHEADERTOITEM = this.getOwnerComponent().getModel("tableData").getProperty("/NAVMDHEADERTOITEM");

			for (var i = 0; i < sData.NAVVRHEADERTOITEM.length; i++) {
				if (sData.NAVVRHEADERTOITEM[i].MDNUMBER != undefined) {
					delete sData.NAVVRHEADERTOITEM[i].MDNUMBER;
				}
				if (sData.NAVVRHEADERTOITEM[i].ITEMNO != undefined) {
					delete sData.NAVVRHEADERTOITEM[i].ITEMNO;
				}
				if (sData.NAVVRHEADERTOITEM[i].MATERIALNO != undefined) {
					delete sData.NAVVRHEADERTOITEM[i].MATERIALNO;
				}
				sData.NAVVRHEADERTOITEM[i]["TRNUMBER"] = this.getOwnerComponent().getModel("vendorModel").getProperty("/TRNUMBER");
				sData.NAVVRHEADERTOITEM[i]["DESTINATIONBIN"] = this.getOwnerComponent().getModel("vendorModel").getProperty("/PONUMBER");

				sData.NAVVRHEADERTOITEM[i].QUANTITY = sData.NAVVRHEADERTOITEM[i].QUANTITY.toString();
			}

			this.getOwnerComponent().getModel().create("/VRHEADERSet", sData, {
				success: function (oData, oResponse) {

					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					MessageBox.success(oData.MESSAGE, {
						icon: MessageBox.Icon.SUCCESS,
						title: "Success",
						contentWidth: "100px",
						onClose: function (oAction) {
							if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE" || oAction === null) {
								var vendorData = new JSONModel({
									WHNUMBER: "",
									MDNUMBER: "",
									TRNUMBER: "",
									PONUMBER: "",
									NAVMDHEADERTOITEM: []
								});
								this.getOwnerComponent().setModel(vendorData, "vendorModel");
								this.getOwnerComponent().getModel("vendorModel").refresh();
								this.getOwnerComponent().getModel("vendorModel").updateBindings();

								var lineitemData = new JSONModel({
									MDNUMBER: "",
									ITEMNO: "",
									MATERIALNO: "",
									BATCH: "",
									QUANTITY: "",
									UNIT: "",
									SOURCEBIN: ""
								});
								this.getOwnerComponent().setModel(lineitemData, "lineitemData");
								this.getOwnerComponent().getModel("lineitemData").refresh();
								this.getOwnerComponent().getModel("lineitemData").updateBindings();

								var tableData = new JSONModel({
									NAVMDHEADERTOITEM: []
								});

								this.getOwnerComponent().setModel(tableData, "tableData");
								this.getOwnerComponent().getModel("tableData").refresh();
								this.getOwnerComponent().getModel("tableData").updateBindings();

								if (this.getOwnerComponent().getModel("tableData").getProperty("/NAVMDHEADERTOITEM").length > 0) {
									this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
									this.byId("tableData").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items") + " (" +
										this.getOwnerComponent()
										.getModel("tableData").getProperty("/NAVMDHEADERTOITEM").length + ")");
								} else {
									this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
									this.byId("tableData").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items"));
								}

								jQuery.sap.delayedCall(400, this, function () {
									this.byId("material").focus();
								});
							}
						}.bind(this)
					});
				}.bind(this),
				error: function (error) {
					this.getErrorDetails(error, this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
						"unabletoCreateReturntovendor"));
				}.bind(this)
			});
		},

		getErrorDetails: function (error, data) {
			var audio = new Audio(this.path);
			audio.play();
			jQuery.sap.delayedCall(5000, this, function () {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
				if (JSON.parse(error.responseText).error.innererror.errordetails.length > 1) {
					var x = JSON.parse(error.responseText).error.innererror.errordetails;
					var details = '<ul>';
					var y = '';
					if (x.length > 1) {
						for (var i = 0; i < x.length - 1; i++) {
							y = '<li>' + x[i].message + '</li>' + y;
						}
					}
					details = details + y + "</ul>";

					MessageBox.error(data, {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						details: details,
						contentWidth: "100px",
						onClose: function (oAction) {
							if (oAction == "OK" || oAction == "CANCEL" || oAction == "CLOSE") {

							}
						}.bind(this)
					});
				} else {
					MessageBox.error(JSON.parse(error.responseText).error.message.value, {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						contentWidth: "100px",
						onClose: function (oAction) {
							if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {

							}
						}.bind(this)
					});
				}
			});
		},

		getFormField: function (oFormContent) {
			var c = 0;
			for (var i = 0; i < oFormContent.length; i++) {
				if (oFormContent[i].getMetadata()._sClassName === "sap.m.Input" && oFormContent[i].getVisible() === true && oFormContent[i].getRequired() ===
					true) {
					if (oFormContent[i].getValue() == "") {
						oFormContent[i].setValueState("Error");
						oFormContent[i].setValueStateText(oFormContent[i - 1].getText() + " " + this.getOwnerComponent().getModel("i18n").getResourceBundle()
							.getText(
								"isX"));
						oFormContent[i].focus();
						c++;
						return c;
						break;
					}
				}
			}
		}

	});

});