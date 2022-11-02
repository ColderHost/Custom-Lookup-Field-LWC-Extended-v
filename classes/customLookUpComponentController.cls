public with sharing class customLookUpComponentController {
    @AuraEnabled(cacheable=true)
    public static List<sObject> getListOfRecords(String filter, String sObjectApiName, String searchKey, String fieldsApiNames) {
        String name = '%' + searchKey + '%';
        String sQuery = '';
        String additionalFields = fieldsApiNames == '' ? '' : ',';

        // Concatenate fields
        if (fieldsApiNames != ''){
            additionalFields += fieldsApiNames;
        }

        if (filter == ''){
            sQuery = 'SELECT Id, Name ' + additionalFields + 
                ' FROM ' + sObjectApiName + 
                ' WHERE Name LIKE : name ' + 
                ' ORDER BY CreatedDate DESC LIMIT 5 ';
        } else {
            sQuery = 'SELECT Id, Name ' + additionalFields + 
                ' FROM ' + sObjectApiName +
                ' WHERE Name LIKE : name AND ' + filter +
                ' ORDER BY CreatedDate DESC LIMIT 5';
        }

        List<sObject> returnList = new List<sObject> ();
        for (sObject obj : Database.Query(sQuery)){
            returnList.add(obj);
        }

        return returnList;
    }
}