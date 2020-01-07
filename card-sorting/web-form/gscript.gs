var readSheetName = "1. Setup";
var cardsRange = "A2:A";
var writeSheetName = "Forms";

function doPost(e){
  var res = {};
  if(e.parameters.type == "write"){
    var rows = JSON.parse(e.parameters.values);
    rows.forEach(function(columns){
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(writeSheetName);
      var range = sheet.getRange(getLastRow(writeSheetName), 1, 1, columns.length);
      range.setValues([columns]);
    });
    res.status = "success";
  }
  return ContentService.createTextOutput(JSON.stringify(res));
}

function doGet(e) {
  var res = {};
  if(e.parameters.type == "getCards"){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(readSheetName);
    var cards = sheet.getRange(cardsRange).getValues().filter(String).map(function(row){ return row[0]; });
    res.status = "success";
    res.result = cards;
  }
  return ContentService.createTextOutput(JSON.stringify(res));
}

function getLastRow(sheetName){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(writeSheetName);
  var Avals = sheet.getRange("A1:A").getValues();
  return lastRow = Avals.filter(String).length + 1;
}
