import { LightningElement } from 'lwc';

export default class TestLookUp extends LightningElement {


    test(event) {
        console.log(event.detail.selectedRecord);
        console.log(event.detail.index);
    }
}