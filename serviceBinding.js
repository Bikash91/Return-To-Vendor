function initModel() {
	var sUrl = "/NLDEV/odata/SAP/ZUPL_SOUND_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}