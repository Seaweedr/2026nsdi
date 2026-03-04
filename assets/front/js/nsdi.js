        // search 
        var input = document.getElementById("searchInput");
        input.addEventListener("keyup", function(event) {
          event.preventDefault();
          if (event.keyCode === 13) {
            document.getElementById("search-submit").click();
          }
        });
