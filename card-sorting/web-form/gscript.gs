var readSheetName = "1. Setup";
var cardsRange = "A2:A";
var writeSheetName = "Forms";

function doGet(e) {
  var res = {};
  if(e.parameters.type == "write"){
    var rows = JSON.parse(e.parameters.values);
    Logger.log(e.parameters);
    Logger.log(rows);
    rows.forEach(function(columns){
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(writeSheetName);
      var range = sheet.getRange(getLastRow(writeSheetName), 1, 1, columns.length);

      Logger.log(getLastRow(writeSheetName));
      Logger.log(columns);
      Logger.log(columns);
      range.setValues([columns]);
    });
    res.status = "success";
  }
  else if(e.parameters.type == "getCards"){
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
