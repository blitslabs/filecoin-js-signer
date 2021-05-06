

class FilecoinLoan {

    public filErc20: FILERC20
    public erc20Fil: ERC20FIL

    constructor() {
        this.filErc20 = new FILERC20()
        this.erc20Fil = new ERC20FIL()
    }
}

class FILERC20 {

    createBorrowRequest() {
        
    }
}

class ERC20FIL {

}

const filoan = new FilecoinLoan()
filoan.filErc20.createBorrowRequest