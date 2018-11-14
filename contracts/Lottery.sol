pragma 0.4.24;

import "./Ownable.sol";

contract Lottery is Ownable {

    uint ticketPrice;
    uint endingTime;
    uint ticketsSold;
    uint ticketsPerPerson;
    uint fee;

    event LotteryCreated(uint ticketPrice);
    event LotteryCanceled();
    event LotteryFinished(address winner, uint ticketsSold); 
    event TicketPurchased(uint buyer, uint ticketPrice);

    constructor(uint _ticketPrice, uint _ticketsPerPerson, uint _fee, uint _endingTime) {
        require(msg.sender == owner);
        ticketPrice = _ticketPrice;
        ticketsPerPerson = _ticketsPerPerson;
        fee = _fee;
        endingTime = _endingTime;
    }

    function buyTicket() public payable {

    } 

    function cancelLottery() public onlyOwner {

    }

    function _lotteryEnded() private returns(bool) {
        return block.timestamp >= endingTime;
    }

    function finishLottery() public onlyOwner {
        require(_lotteryEnded());
    }
}