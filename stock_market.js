// http://code.google.com/p/yahoo-finance-managed/wiki/miscapiImageDownload
// http://chart.finance.yahoo.com/z?

money.stock_market = (function(){

	return {
	
		fetching: false,
		
		data: {},
		
		symbols: {},
		
		html: "",
		
		current: 1,
		
		total: 0,
		
		settings: {
			enabled: true
		},
		
		invest_data: {},
		
		init: function(){
			this.setup();
			
			if(this.settings.enabled){
				if(money.images.stock_market){
					yootil.bar.add("/stockmarket", money.images.stock_market, "Stock Market", "pdmsstock");
				}
			}
			
			if(yootil.location.check.forum() && location.href.match(/\/stockmarket\/?/i)){
				if(this.settings.enabled){
					this.check_for_data();
					this.start();
				} else {
					money.show_default();
				}
			}
		},
		
		register: function(){
			money.modules.push(this);
			return this;
		},
		
		start: function(){
			this.html = "<div id='stockcontent' style='text-align: center; padding: 10px'><img src='" + money.images.preloader + "' /></div>";
			this.fetch_stock_data();
			
			yootil.create.page("stockmarket", "Stock Market");
			yootil.create.nav_branch("/stockmarket/", "Stock Market");	
			
			yootil.create.container("<div style='float: left'>Stock Market Investments</div><div style='float: right'>Funds: " + money.settings.money_symbol + "<span id='pd_money_wallet_amount'>" + money.get(true) + "</span></div>", "Show investments here...").show().appendTo("#content");
			
			yootil.create.container("<div style='float: left'>Stock Market<span id='stock-market-total'></span></div><div style='cursor: pointer; float: right'><span id='stock-left'>&laquo; Previous</span> &nbsp;&nbsp;&nbsp; <span id='stock-right'>Next &raquo;</span></div>", this.html).show().appendTo("#content");
		},
		
		setup: function(){
			if(money.plugin){
				var settings = money.plugin.settings;
				
			}
		},
		
		fetch_stock_data: function(){
			this.fetching = true;

			$.ajax({
				url: "http://pixeldepth.net/proboards/plugins/monetary_system/stock/quotes.php",
				context: this,
				crossDomain: true,
				dataType: "json",
							
				error: function(){
					console.log(arguments);
				}
			}).done(function(data){
				this.fetching = false;
				
				if(data && data.results && data.results.length){
					this.data = data.results;
				}
					
				this.build_stock_table();
			});
		},
		
		check_for_data: function(){
			if(money.data.stock){
				this.invest_data = money.data.stock;
			}
		},
		
		has_invested: function(stock_symbol){
			if(this.invest_data[stock_symbol]){
				return true;
			}
			
			return false;
		},
		
		// If symbol is removed, should we refund original money??
		
		remove_from_data: function(stock_symbol){
			if(this.has_invested(stock_symbol)){
				delete this.invest_data[stock_symbol];
			}
		},
		
		// Flag a stock that is no longer in use so we can do something with it later
		
		flag_invested: function(stock_symbol){
			if(this.has_invested(stock_symbol)){
				this.invest_data[stock_symbol].rm = 1;
			}
		},
		
		// How much stock?
		
		invest_amount: function(stock_symbol){
			if(this.has_invested(stock_symbol)){
				return this.invest_data[stock_symbol].a;
			}
			
			return 0;
		},
		
		// TODO: Tidy up inline CSS
		
		build_stock_table: function(){
			var stock_table = $("<div class='stock-wrapper' style='position: relative; left: 0px; width: 15000px; height: 100%'></div>");
			
			$("#stock-market-total").html(" (" + this.data.length + ")");
			
			for(var d = 0, dl = this.data.length; d < dl; d ++){
				var up_down = "";
				var stock_html = "";
				
				this.symbols[this.data[d].Symbol] = this.data[d];
				
				if(parseFloat(this.data[d].PreviousClose) < parseFloat(this.data[d].BidRealtime)){
					up_down = "<img src='" + money.images.up + "' /> ";
				} else if(parseFloat(this.data[d].PreviousClose) > parseFloat(this.data[d].BidRealtime)){
					up_down = "<img src='" + money.images.down + "' /> ";
				}
												
				stock_html += "<div class='stock-block' style='float: left; width: 908px; height: 100%'>";
				stock_html += "<div style='border-bottom: 2px solid; font-size: 18px; padding: 5px;'>";
				stock_html += "<div style='float: left;'>" + this.data[d].Name + " (" + this.data[d].Symbol + ") <span style='position: relative; top: -2px;' id='stock-invest-buttons'><button id='stock-buy-button' data-stock-id='" + this.data[d].Symbol + "'>Buy</button></span></div>";
				stock_html += "<div style='float: right'>" + this.data[d].BidRealtime + " " + up_down + "<span style='font-size: 14px;'>" + this.data[d].ChangeAndPercent + " (" + this.data[d].RealPercentChange + ")</span></div><br style='clear: float' /></div>";
				
				stock_html += "<table style='width: 32%; float: left; margin-right: 20px; margin-top: 15px;'>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>Previous Close:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].PreviousClose + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>Bid:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].Bid + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>Volume:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].Volume + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>1 Year Target:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].YearTarget + "</td>";
				stock_html += "</tr>";
				
				stock_html += "</table>";

				stock_html += "<table style='width: 31%; float: left; margin-top: 15px; margin-right: 20px;'>";
			
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>Open:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].Open + "</td>";
				stock_html += "</tr>";

				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>Day's Low:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].DaysLow + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>Day's High:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].DaysHigh + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>P/E:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].PERatio + "</td>";
				stock_html += "</tr>";
				
				stock_html += "</table>";

				stock_html += "<table style='width: 32%; float: left; margin-top: 15px;'>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>Days Range:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].DaysRange + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>52 Week Range:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].Week52Range + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>Market Cap.:</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].MarketCapitalization + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td style='text-align: left; padding: 8px; border-bottom: 1px solid;'>EPS</td>";
				stock_html += "<td style='text-align: right; padding: 8px; border-bottom: 1px solid; font-weight: bold;'>" + this.data[d].EPS + "</td>";
				stock_html += "</tr>";
				
				stock_html += "</table>";
				
				stock_html += "<br style='clear: both' />";
				stock_html += "<div style='margin-top: 10px; text-align: center; border: 1px solid; padding: 5px;'>";
				stock_html += "<img src='http://chart.finance.yahoo.com/z?s=" + this.data[d].Symbol + "&t=2w&l=off&z=l' />";
				stock_html += "</div>";
				stock_html += "</div>";
				
				var stock_obj = $(stock_html);
				
				stock_obj.find("#stock-buy-button").click(function(){
					console.log($(this).attr("data-stock-id"));
				});
				
				stock_table.append(stock_obj);
				
				this.total ++;
			}
			
			var stock_content = $("<div class='stock-content' style='overflow: hidden;'></div>").append(stock_table);
			
			this.html = stock_content;
			this.update();
		},
		
		update: function(){
			var self = this;
			
			$("#stockcontent").empty().append($(this.html));

			$("#stock-right").click(function(){
				if(self.current == self.total){
					return false;
				}
    
				self.current ++;
    
				$(".stock-wrapper").animate({"left": "-=908px"}, "slow");
			});
			
			$("#stock-left").click(function(){
				if(self.current <= 1){
					return false;
				}
    
				self.current --;
    
				$(".stock-wrapper").animate({"left": "+=908px"}, "slow");
			});
			
		}
	
	};
	
})().register();