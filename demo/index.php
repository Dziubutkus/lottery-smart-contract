<html lang="en">
	<head>
		<meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Lottery Smart Contract</title>

        <!-- CDN -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
	
		<!-- JavaScripts -->
		<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
		<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
		<script src="js/web3.js"></script>
		<script src="js/core.js"></script>
	</head>
	<body>
		<div class="container pt-5">
			<?php if (isset($_GET['no-web3'])) { ?>
			<div class="row">
				<div class="col-md-12">
					<h3>Please install <strong>web3</strong> provider!</h3>
					<p>Please install MetaMask or other web3 provider. If you have already web3 provider - refresh page.</p>
				</div>
			</div>
			<?php die(); } ?>
			<?php if (isset($_GET['metamask-locked'])) { ?>
			<div class="row">
				<div class="col-md-12">
					<h3>Please unlock <strong>MetaMask</strong> provider!</h3>
					<p>Please unlock MetaMask or other web3 provider. If you have already unlocked web3 provider - refresh page.</p>
				</div>
			</div>
			<?php die(); } ?>
			<div class="row">
				<div class="col-md-8">
					<div class="card metamask-info">
						<div class="card-body">
							<div class="alert alert-warning mb-0" role="alert">
								Your Wallet address: <strong class="w_address">Loading</strong><br>
								Your balance: <strong class="w_balance">Loading</strong>
							</div>
						</div>
					</div>
					<div class="card mt-3">
						<div class="card-body">
							<button type="button" id="buy_ticket" class="btn btn-primary btn-sm">Buy ticket!</button>
						</div>
					</div>
					<div class="card mt-3 owner_menu" style="display: none;">
						<div class="card-body">
							<h3>Owner menu</h3>
							<hr>
							<div class="row px-3">
								<button type="button" class="btn btn-primary btn-sm mr-2" onclick="return confirm('Are you sure want to finish lottery?');">Finish lottery</button>
								<button type="button" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure want to cancel lottery?');">Cancel lottery</button>
								<button type="button" class="btn btn-primary btn-sm text-right ml-auto">Restart lottery</button>
							</div>
						</div>
					</div>
				</div>
				<div class="col-md-4">
					<div class="alert alert-primary" role="alert">
						<h4 class="alert-heading">Lottery</h4>
					  	<hr>
					  	<p>Some stats about lottery:</p>
					  	<ul>
					  		<li>Lottery status is: <strong class="l_status">Loading</strong></li>
					  		<li>Lottery ending time is: <strong class="l_ending_time">Loading</strong></li>
					  		<li>Ticket price: <strong class="l_price">Loading</strong></li>
					  		<li>Tickets amount: <strong class="l_amount">Loading</strong></li>
					  		<li>Max tickets per person: <strong class="l_tickets_per_person">Loading</strong></li>
					  		<li>Tickets sold: <strong class="l_sold">Loading</strong></li>
					  		<li>Unique owners: <strong class="l_unique_owners">Loading</strong></li>
					  		<li>Fee: <strong class="l_fee">Loading</strong></li>
					  	</ul>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>