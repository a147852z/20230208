const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var fs = require("fs");
var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.personal.unlockAccount(web3.eth.accounts[0],"123456",300);

rl.question("是否要增加備註 (y,備註內容) or n:",(strr) => {
	strr = strr.split(',')
	fs.readFile(process.argv[2] , function (error, data)//要讀取的目錄
	{  // 若錯誤 error 為一個物件，則會在這邊觸發內部程式碼，作為簡單的錯誤處理
		if (error)
		{
		   console.log('讀取檔案失敗');
		   return;
		}
			if (strr[0] == "y"){
			var string = data.toString();
			var metadata = string.substr(0,data.length);
			metadata = metadata + "Remark:" + strr[1]
			var hexdata = web3.toHex(metadata);
			var up= web3.eth.sendTransaction({from:web3.eth.accounts[0],data:hexdata,gas:1000000});
			fs.writeFile( process.argv[3], up ,function (error)
			{
			  //console.log(error);
			  console.log("文件上傳成功");
			});
		}else{
			var string = data.toString();
			var metadata = string.substr(0,data.length);
			var hexdata = web3.toHex(metadata);
			var up= web3.eth.sendTransaction({from:web3.eth.accounts[0],data:hexdata,gas:1000000});
			fs.writeFile( process.argv[3], up ,function (error)
			{
			  //console.log(error);
			  console.log("文件上傳成功");
			});
		}
	});
	rl.close();
});
