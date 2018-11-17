//const { ether } = require('./helpers/ether');
const { ethGetBalance } = require('./helpers/web3');
const { assertRevert } = require('./helpers/assertRevert');
const { increaseTo } = require('./helpers/time');
const { increase } = require('./helpers/time');


const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Lottery = artifacts.require('Lottery');

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};

contract('Lottery', function ([owner, participant1, participant2]) {
    const ticketPrice = 28; // $5 in finney
    const ticketsPerPerson = 1000;
    const fee = 10; // 10%
    const endingTime = Math.floor(Date.now() / 1000) + duration.minutes(2);
    const ticketAmount = 1;

    before(async function () {
        this.lottery = await Lottery.new(ticketPrice, ticketsPerPerson, fee, endingTime, ticketAmount, {from: owner});
    });

    describe('buying tickets', function () {
        it('should revert when amount is lower than the price', async function () {
            var preBalance = await ethGetBalance(participant1);
            for(i = 0; i < 100; i++) {
                await this.lottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice, 'finney')});
            }
            var postBalance = await ethGetBalance(participant1);
            console.log(web3.fromWei(preBalance, 'ether') + " " + web3.fromWei(postBalance, 'ether'));
        });
        it('should increase time', async function() {
            await increaseTo(endingTime + 1);
        });
        it('should finish lottery and send funds to winner and owner', async function() {
            var ownerBalance = await ethGetBalance(owner);
            var preBal = await ethGetBalance(participant1);
            console.log("Contract's balance: " + web3.fromWei(await ethGetBalance(this.lottery.address), 'ether'));
            await this.lottery.finishLottery({from: owner});
            var postOwner = await ethGetBalance(owner);
            var postBal = await ethGetBalance(participant1);
            console.log("Owner:\n" + web3.fromWei(ownerBalance,'ether') + " " + web3.fromWei(postOwner, 'ether'));
            console.log("Participant:\n" + web3.fromWei(preBal,'ether') + " " + web3.fromWei(postBal, 'ether'));
        });
    });
});
