<!DOCTYPE html>
<html lang="en">
<head>
    <title>Game Dashboard</title>
    <?php include 'includes.php'; ?> 
    <link href="css/score.css" rel="stylesheet" type="text/css">
    
</head>
<body>
    <?php include 'menu.php'; ?>
<!-- Source: https://codepen.io/ryanparag/pen/ZEGLqGW -->
  <div class="l-wrapper">
    <div class="l-grid">
      <div class="l-grid__item l-grid__item--sticky">
        <div class="c-card u-bg--light-gradient u-text--dark">
          <div class="c-card__body">
            <div class="u-display--flex u-justify--space-between">
              <div class="u-text--left">
                <div class="u-text--small">My Rank</div>
                <h2>3rd Place</h2>
              </div>
              <div class="u-text--right">
                <div class="u-text--small">My Score</div>
                <h2>24</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="l-grid__item">
        <div class="c-card">
          <div class="c-card__body">
            <ul class="c-list" id="list">
              <li class="c-list__item">
                <div class="c-list__grid">
                  <div class="u-text--left u-text--small u-text--medium">Rank</div>
                  <div class="u-text--left u-text--small u-text--medium">User</div>
                  <div class="u-text--right u-text--small u-text--medium">Points</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script src="js/score.js"></script>
<?php include 'footer.php'; ?> 
</body>
</html>