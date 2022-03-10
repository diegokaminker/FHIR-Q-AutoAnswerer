//
//FHIR-Q-AutoAnswerer: Creates a QuestionnaireResponse Template from
//                     a FHIR Questionnaire
//Created by Diego Kaminker - HL7 Argentina, HL7 International
//Copyright: CC-BY
//Date: 2022-03-10
//Version 1.0
//Input: questionnaire.json, in this same folder
//Output: response.json, in this same folder
//Strings will be inside {{}}
//Dates and other datatypes will be valid
//CodeSystems are extracted from the ValueSet Name
//            not very robust but better than nothing
//
const { debug } = require("console");
const fs = require("fs");
fs.readFile("./questionnaire.json", "utf8", (err, jsonString) => {
  if (err) {
    console.log("File read failed:", err);
    return;
  }
  const Q = JSON.parse(jsonString);
  var
    QR =
    {
      "resourceType": "QuestionnaireResponse",
      "status": "completed",
      "authored": "2022-03-10T10:20:00Z",
      "questionnaire": Q.url,
      "item": []
    };
  function ProcessItem(Padre, UnItem) {

    var MyItem=null;

    switch (UnItem.type) {
      case "group":
       // console.log("-" + UnItem.linkId);   
        MyItem = {

          "linkId": UnItem.linkId,
          "text": UnItem.text ,
          "item": []
        };

        UnItem.item.forEach(function (UnItem2)
         {
           MyItem.item.push(ProcessItem(MyItem.item, UnItem2));
          
         }
           
        )
        ;
  
        
        
        break;

      case "string":
        MyItem = {

          "linkId": UnItem.linkId,
          "text": UnItem.text,
          "answer": [
            { "valueString": "{{Respuesta para " + UnItem.linkId + "}}" }
          ]
        };

       
        break;
      case "date":
        MyItem = {

          "linkId": UnItem.linkId,
          "text": UnItem.text,
          "answer": [
            {
              "valueDate": "2022-01-01"
            }
          ]
        };
       
        break;
      case "integer":
        MyItem = {

          "linkId": UnItem.linkId,
          "text": UnItem.text,
          "answer": [
            {
              "valueInteger": 0
            }
          ]
        };
       
        break;
      case "time":
        MyItem = {

          "linkId": UnItem.linkId,
          "text": UnItem.text,
          "answer": [
            {
              "valueTime": "00:00:00"
            }
          ]
        };
       
        break;

      case "dateTime":
        MyItem = {

          "linkId": UnItem.linkId,
          "text": UnItem.text,
          "answer": [
            {
              "valueDateTime": "2022-01-01T00:00:00Z"
            }
          ]
        };
       
        break;

      case "boolean":
        MyItem = {

          "linkId": UnItem.linkId,
          "text": UnItem.text,
          "answer": [
            {
              "valueBoolean": false
            }

          ]
        };
       
        break;
      case "choice":
        var vs = "";
        if (UnItem.answerValueSet) {
          vs = UnItem.answerValueSet;
          vs = vs.replace("ValueSet", "CodeSystem");
          vs = vs.replace("VS", "CS");
        }
        MyItem = {

          "linkId": UnItem.linkId,
          "text": UnItem.text,
          "answer": [
            {
              "valueCoding": {
                "system": vs,
                "code": "{{codigo_para_" + UnItem.linkId + "}}",
                "display": "{{descripcion_para_" + UnItem.linkId + "}}"
              }
            }

          ]
        };
       
        break;

      default:
        console.log("Not Supported Type");
        console.log(UnItem.type);
    }
    return MyItem;
  }

  Q.item.forEach(function (UnItem) {
    MyItem=[];
    QR.item.push(ProcessItem(MyItem, UnItem))
  }
  );
  const resp=JSON.stringify(QR);
  const fina="./response.fhir.json";
  fs.writeFile(fina,resp,
    err=>{
            if (err){console.error(err)
              return
  }});
  console.log("Archivo "+fina+" creado con exito");
  
});