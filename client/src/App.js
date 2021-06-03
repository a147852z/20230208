import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import SimpleToken from "./contracts/SimpleToken.json";

export default class App_2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "unknown",
      defaultAccount: "0x2A2c9fb3132a513AD77144fD2D0BB872fb1E765E",
      transAccount: "",
      Contract: {},
      tokenName: "",
      symbol: "",
      userBalance: "0",
      loading: true,
      amount: "",
    };
    this.loadWeb3();
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    //web3連線
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
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

      const tokenName = await Contract.methods.name().call();
      const symbol = await Contract.methods.symbol().call();

      this.setState({
        tokenName: tokenName.toString(),
        symbol: symbol.toString(),
        userBalance: balance.toString(),
      });
    } else {
      window.alert("Token contract not deployed to detected network.");
    }
  }

  approve = () => {
    this.setState({ loading: true });
    //透過合約裡的approve方法獲取轉帳的許可值
    this.state.Contract.methods
      .approve(this.state.transAccount, this.state.amount)
      .send({ from: this.state.defaultAccount });
    this.setState({ loading: false });
  };

  transfer = () => {
    this.setState({ loading: true });
    //透過合約裡的transfer方法從發布者手中轉帳
    this.state.Contract.methods
      .transfer(this.state.transAccount, this.state.amount)
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
    if (this.state.loading) {
      <p>Loading...</p>;
    }
    document.title = "Simple transfer dapp";
    return (
      <div className="App">
        <h1>Good to Go!</h1>

        <h2>{this.state.tokenName}!!</h2>

        <p>Address: {this.state.account}</p>
        <p>
          Balance: {this.state.userBalance} {this.state.symbol}
        </p>
        <hr />
        <div>
          <div>
            欲轉帳位址:
            <input
              type="text"
              value={this.state.transAccount}
              onChange={(e) => this.handleInputAccount(e)}
            />
          </div>
          <div>
            欲轉帳金額:
            <input
              type="text"
              value={this.state.amount}
              onChange={(e) => this.handleInputAmount(e)}
            />
          </div>

          <button onClick={() => this.approve()}>Approve</button>
          <button onClick={() => this.transfer()}>Transfer</button>
        </div>
      </div>
    );
  }
}
