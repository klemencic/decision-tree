import './index.css';   

const Navbar = () => {
    return (
        <nav className="navbar">
         <div>
            <h1>Odlocitveno drevo</h1>
            <div className="links">
                <a href="/drevo">Create drevo</a>
                
            </div>
         </div>
        </nav>
    );
}

export default Navbar;