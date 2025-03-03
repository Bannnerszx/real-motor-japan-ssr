self.onmessage = (e) => {
    const { data, searchQuery } = e.data;

    // Safely filter the data in the worker thread
    const filteredData = Array.isArray(data)
    ? data.filter((item) => {
          // Convert item to a string if it's an integer
          const itemText = 
              typeof item === "string" 
                  ? item 
                  : typeof item === "number" 
                  ? item.toString() 
                  : item?.name || "";

          return itemText.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];


    // Post the filtered data back to the main thread
    self.postMessage(filteredData);
};
