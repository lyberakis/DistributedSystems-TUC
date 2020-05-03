<!-- foooter -->
<div id="footer">
	<div class="footer_text">
	Designed by <a href="mailto:x@gmail.com" target="_blank">Coming Soon</a> &copy; 
	<?php 
		$copyYear = 2020; 
		$curYear = date('Y'); 
		echo $copyYear . (($copyYear != $curYear) ? '-' . $curYear : '');
	?>
	</div>
</div>