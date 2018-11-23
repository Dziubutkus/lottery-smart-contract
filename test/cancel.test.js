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
    const ticketPrice = 20; // $5 in finney
    const ticketsPerPerson = 5;
    const fee = 10; // 10%
    const endingTime = Math.floor(Date.now() / 1000) + duration.minutes(1);
    const ticketAmount = 1;

    before(async function () {
        this.lottery = await Lottery.new(ticketPrice, ticketsPerPerson, fee, endingTime, ticketAmount, {from: owner});
    });

    describe('buying tickets', function () {
        it('both participants should buy max tickets', async function() {
            const prebal1 = await ethGetBalance(participant1);
            //const prebal2 = await ethGetBalance(participant2);

            //var gasForPurchase = await this.lottery.buyTicket.estimateGas({ from: participant1, value: web3.toWei(ticketPrice, 'finney') });
            //gasForPurchase = await web3.toWei(gasForPurchase, 'gwei');
           // for(var i = 0; i < ticketsPerPerson; i++) {
                var tx = await this.lottery.buyTicket({ from: participant1, value: web3.toWei(ticketPrice, 'finney') });
                var gas = tx.receipt.gasUsed;
                console.log(gas);
                console.log(await web3.toWei(gas, 'gwei'));
                console.log(await web3.toWei(ticketPrice, 'finney'));

                //await this.lottery.buyTicket({ from: participant2, value: //web3.toWei(ticketPrice, 'finney') });
            //}
            

            const postbal1 = await ethGetBalance(participant1);
            //const postbal2 = await ethGetBalance(participant2);

            console.log(prebal1.toNumber(), postbal1.toNumber(), prebal1-postbal1, await web3.toWei(ticketsPerPerson * ticketPrice, 'finney'));

            //console.log(await web3.fromWei(gasForPurchase, 'ether'));
            //console.log(web3.toWei(ticketPrice,'finney') + gasForPurchase);
            console.log(await web3.fromWei(prebal1-postbal1, 'ether'));
            
            //assert.equal(prebal1 - postbal1, await web3.toWei(ticketsPerPerson * ticketPrice, 'finney'));
            //assert.equal(prebal2 - postbal2, await web3.toWei(ticketsPerPerson * ticketPrice, 'finney'));
        });
    });
});