const MakerGrid = () => {
  return (
    <div className="makers-container">
      <div className="makers-header">
        <h2>Search by Makers</h2>
        <button className="view-all">View all Makers</button>
      </div>
      <div className="makers-grid">
        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">TOYOTA</span>
            <span className="maker-count">368</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">NISSAN</span>
            <span className="maker-count">117</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">HONDA</span>
            <span className="maker-count">43</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">MITSUBISHI</span>
            <span className="maker-count">52</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">MERCEDES</span>
            <span className="maker-count">42</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">BMW</span>
            <span className="maker-count">26</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">SUZUKI</span>
            <span className="maker-count">9</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">SUBARU</span>
            <span className="maker-count">25</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">VOLKSWAGEN</span>
            <span className="maker-count">9</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">MAZDA</span>
            <span className="maker-count">48</span>
          </div>
        </div>
      </div>
    </div>
  )
};
const TypeGrid = () => {
  return (
    <div className="makers-container">
      <div className="makers-header">
        <h2>Search by Types</h2>
        <button className="view-all">View all Makers</button>
      </div>



      <div className="makers-grid">
        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">SEDAN</span>
            <span className="maker-count">368</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">TRUCK</span>
            <span className="maker-count">117</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">SUV</span>
            <span className="maker-count">43</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">HACHBACK</span>
            <span className="maker-count">52</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">WAGON</span>
            <span className="maker-count">42</span>
          </div>
        </div>

        <div className="maker-item">
          <div className="maker-logo"></div>
          <div className="maker-info">
            <span className="maker-name">VAN/MINIVAN</span>
            <span className="maker-count">26</span>
          </div>
        </div>

      </div>
    </div>
  )
}
export function HomeSSR({ }) {
  return (
    <div>
      <div className="search-form">
        <div className="container">
          <form>
            <div className="form-row">
              <div className="form-group">
                <select className="form-control">
                  <option selected disabled>
                    Select Make
                  </option>
                  <option>Toyota</option>
                  <option>Honda</option>
                  <option>Ford</option>
                  <option>Chevrolet</option>
                  <option>BMW</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-control">
                  <option selected disabled>
                    Select Model
                  </option>
                  <option>Camry</option>
                  <option>Civic</option>
                  <option>F-150</option>
                  <option>Silverado</option>
                  <option>3 Series</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-control">
                  <option selected disabled>
                    Body Type
                  </option>
                  <option>Sedan</option>
                  <option>SUV</option>
                  <option>Truck</option>
                  <option>Coupe</option>
                  <option>Convertible</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <select className="form-control">
                  <option selected disabled>
                    Min Price
                  </option>
                  <option>$5,000</option>
                  <option>$10,000</option>
                  <option>$15,000</option>
                  <option>$20,000</option>
                  <option>$25,000</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-control">
                  <option selected disabled>
                    Min Year
                  </option>
                  <option>2015</option>
                  <option>2016</option>
                  <option>2017</option>
                  <option>2018</option>
                  <option>2019</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-control">
                  <option selected disabled>
                    Min Mileage
                  </option>
                  <option>10,000</option>
                  <option>25,000</option>
                  <option>50,000</option>
                  <option>75,000</option>
                  <option>100,000</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <select className="form-control">
                  <option selected disabled>
                    Max Price
                  </option>
                  <option>$30,000</option>
                  <option>$40,000</option>
                  <option>$50,000</option>
                  <option>$60,000</option>
                  <option>$70,000</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-control">
                  <option selected disabled>
                    Max Year
                  </option>
                  <option>2020</option>
                  <option>2021</option>
                  <option>2022</option>
                  <option>2023</option>
                  <option>2024</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-control">
                  <option selected disabled>
                    Max Mileage
                  </option>
                  <option>25,000</option>
                  <option>50,000</option>
                  <option>75,000</option>
                  <option>100,000</option>
                  <option>150,000</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group search-input-container">
                <input type="text" className="search-input" placeholder="Search by make, model, or keyword" />
              </div>
              <div className="form-group search-button-container">
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="scroll-container">

        <div class="gradient-left"></div>


        <div class="scroll-content">
          <button class="scroll-item" onclick="scrollToSection('searchByMakes')">By Makers</button>
          <div class="divider"></div>

          <button class="scroll-item" onclick="scrollToSection('newArrivals')">New Arrivals</button>
          <div class="divider"></div>

          <button class="scroll-item" onclick="scrollToSection('searchByTypes')">By Types</button>
          <div class="divider"></div>

          <button class="scroll-item" onclick="scrollToSection('searchByTrucks')">By Trucks</button>
          <div class="divider"></div>

          <button class="scroll-item" onclick="scrollToSection('howToBuy')">How to Buy</button>
        </div>


        <div class="gradient-right"></div>
      </div>
      <MakerGrid />
      <TypeGrid />

    </div>
  )
} 