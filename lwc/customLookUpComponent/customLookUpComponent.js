import { LightningElement, api, track, wire } from 'lwc';
import controller from "@salesforce/apex/customLookUpComponentController.getListOfRecords"

const DELAY = 300;

export default class CustomLookUpComponent extends LightningElement {
    @api placeholder = "";
    @api label = ""
    @api iconName = "standard:account";
    @api iconSize = "medium";
    @api filter = "";
    @api sObjectApiName = "";
    @api fieldsApiNames = "";
    @api index = "";

    @track data = [];
    @track filteredData = [];
    @track selectedRecord = {};

    hasRecords = false;
    hasSelected = false;
    notFoundRec = false;
    inputIsEmpty = true;
    searchKey = "";
    delayTimeOut;
    isLoading = false;
    error;

    // Clears InputField
    clearInput() {
        this.inputIsEmpty = true;
        this.elementsVisibilityReg("All");
        this.isLoading = false;
        this.searchKey = "";
        var input = this.template.querySelector('[data-id="lookupInput"]');
        input.value = "";
        input.select();
    }

    @wire(controller, { searchKey: "$searchKey", filter: "$filter", sObjectApiName: "$sObjectApiName", fieldsApiNames: "$fieldsApiNames" })
    searchResult(value) {
        const { data, error } = value;
        this.isLoading = false;
        if (data && this.searchKey != "") {
            this.notFoundRec = data.length == 0 ? true : false;
            this.hasRecords = data.length == 0 || this.searchKey == "" ? false : true;
            this.data = data;

            // Filter the data by input value
            this.filteredData = this.data.filter((elem) => {
                let elemName = elem.Name.toLowerCase();
                let eventValue = this.searchKey.toLowerCase();
                let bool = elemName.includes(eventValue);

                return bool;
            });

            if (this.filteredData.length != 0) {
                this.elementsVisibilityReg("Found");
            } else {
                this.elementsVisibilityReg("Not Found");
            }
        } else if (error) {
            console.log("Error ---> ", JSON.stringify(error));
        }
    }

    // OnChange Input field
    onChangeInput(event) {
        this.isLoading = true;
        if (event.target.value.length == 0) {
            this.isLoading = false;
            this.inputIsEmpty = true;
            this.searchKey = "";
            this.elementsVisibilityReg("All");
        } else {
            this.inputIsEmpty = false;

            const searchKey = event.target.value;
            window.clearTimeout(this.delayTimeOut);
            this.delayTimeOut = setTimeout(() => {
                this.searchKey = searchKey;
            }, DELAY)
        }
    }

    // On Blur remove list of records to select
    onBlurInput() {
        setTimeout(() => {
            this.isLoading = false;
            this.hasRecords = false;
        }, 90);
    }

    // Select Element
    selectElement(event) {
        // Assign selectedRecord object to the retrieved one
        this.data.forEach((elem) => {
            if (elem.Id == String(event.target.dataset.recid)) {
                this.selectedRecord = elem;
            }
        });

        // Change visibility of the lookup 
        var input = this.template.querySelector('[data-name="inputSection"]');
        var selectedInput = this.template.querySelector('[data-name="selectedValueInput"]');
        input.classList.replace("slds-show", "slds-hide");
        selectedInput.classList.replace("slds-hide", "slds-show");
        this.lookUpUpdateHandler();
    }

    // Remove Selected Element
    handleRemove() {
        this.selectedRecord = { Id: "", Name: "" };
        this.clearInput();
        this.searchKey = "";
        var input = this.template.querySelector('[data-name="inputSection"]');
        var selectedInput = this.template.querySelector('[data-name="selectedValueInput"]');
        selectedInput.classList.replace("slds-show", "slds-hide");
        input.classList.replace("slds-hide", "slds-show");
        this.lookUpUpdateHandler();
    }

    // Control visibility of items
    elementsVisibilityReg(elem) {
        switch (elem) {
            case "All":
                this.hasRecords = false;
                this.hasSelected = false;
                this.notFoundRec = false;
                break;
            case "Not Found":
                this.hasRecords = false;
                this.notFoundRec = true;
                break;
            case "Found":
                this.notFoundRec = false;
                this.hasRecords = true;
                break;
        }
    }

    //SentBack Info
    lookUpUpdateHandler() {
        const handler = new CustomEvent("lookupupdate", {
            detail: { selectedRecord: this.selectedRecord, index: this.index },
        });
        this.dispatchEvent(handler);
    }
}