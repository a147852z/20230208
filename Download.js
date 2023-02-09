var fs = require("fs");
var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));


fs.readFile(process.argv[2], function (error, data)//讀取交易hash的目錄

{
    // 若錯誤 error 為一個物件，則會在這邊觸發內部程式碼，作為簡單的錯誤處理
   if (error)
    {
      console.log('讀取檔案失敗');
      return;
    }
    var take = web3.eth.getTransaction(data.toString()).input;
    var download = web3.toAscii(take);
     fs.writeFile( process.argv[3], download ,function (error)
       {
         console.log('metadata已下載並寫入檔案');
      });
      
});

