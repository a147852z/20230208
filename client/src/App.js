import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import SimpleToken from "./contracts/SimpleToken.json";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: false,
      account: "unknown",
      defaultAccount: "0x9Ec4c413328380b225153b424Df8452782A64C6A",
      transAccount: "",
      Contract: {},
      contractAddress: "",
      tokenName: "",
      symbol: "",
      decimals: 0,
      userBalance: "0",
      loading: false,
      amount: "",
      date: new Date(),
    };

    this.loadWeb3();
    this.loadBlockchainData();
  }

  componentDidMount() {
    // await this.loadWeb3();
    this.loadBlockchainData();

    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  tick() {
    this.setState({
      date: new Date(),
    });
  }
  async loadWeb3() {
    //web3連線
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      this.setState({ web3: true });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      this.setState({ web3: true });
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();

    //Load SimpleToken
    const TokenData = await SimpleToken.networks[networkId];

    if (TokenData) {
      //實例化合約
      const Contract = new web3.eth.Contract(
        SimpleToken.abi,
        TokenData.address
      );
      this.setState({ Contract });

      //透過合約裡的balanceOf方法查詢餘額
      let tokenBalance = await Contract.methods
        .balanceOf(this.state.account)
        .call();
      const balance = tokenBalance / 1000000000000000000;

      const contractAddress = await TokenData.address;
      const tokenName = await Contract.methods.name().call();
      const symbol = await Contract.methods.symbol().call();
      const decimals = await Contract.methods.decimals().call();

      this.setState({
        contractAddress: contractAddress.toString(),
        tokenName: tokenName.toString(),
        symbol: symbol.toString(),
        userBalance: balance.toString(),
        decimals: decimals,
      });
    } else {
      window.alert("Token contract not deployed to detected network.");
    }
  }

  approve = () => {
    this.setState({ loading: true });
    //透過合約裡的approve方法獲取轉帳的許可值
    this.state.Contract.methods
      .approve(
        this.state.transAccount,
        this.state.amount + "0".repeat(this.state.decimals)
      )
      .send({ from: this.state.defaultAccount });
    this.setState({ loading: false });
  };

  transfer = () => {
    this.setState({ loading: true });
    //透過合約裡的transfer方法從發布者手中轉帳
    this.state.Contract.methods
      .transfer(
        this.state.transAccount,
        this.state.amount + "0".repeat(this.state.decimals)
      )
      .send({ from: this.state.defaultAccount });
    this.setState({ loading: false });
  };

  //擷取輸入框裡的內容，再將內容傳進state，映射在輸入框裡的內容，
  //此時框裡的內容並不是我們輸入的，而是從state裡提取出來的
  handleInputAccount(e) {
    this.setState({ transAccount: e.target.value });
  }

  handleInputAmount(e) {
    this.setState({ amount: e.target.value });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    } else if (this.state.loading) {
      return <p>Loading...</p>;
    }
    document.title = "區塊鏈互動網頁";
    return (
      <div className="App-header">
        <div>
          <h1>NKUST GSLAB Yi-Tung Liu</h1>
          <h2>這裡是 {this.state.tokenName}!! 區塊鏈互動網頁</h2>
          <h5>請先做驗證 再轉帳</h5>
          <div className="infoBlock">
            <p>合約位址: {this.state.contractAddress}</p>
            <p>用戶位址: {this.state.account}</p>
            <p>
              用戶餘額: {this.state.userBalance} {this.state.symbol}
            </p>
            <p>
              欲轉帳位址:
              <input
                className="inputBox"
                type="text"
                value={this.state.transAccount}
                onChange={(e) => this.handleInputAccount(e)}
              />
            </p>
            <p>
              欲轉帳金額:
              <input
                className="inputBox"
                type="text"
                value={this.state.amount}
                onChange={(e) => this.handleInputAmount(e)}
              />
            </p>
            <p>
              <button className="buttonVerify" onClick={() => this.approve()}>
                驗證
              </button>
              <button
                className="buttonTransfer"
                onClick={() => this.transfer()}
              >
                轉帳
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
