import React from "react";
import Navbar from "../../components/Navbar"
import Button from "@material-ui/core/Button";
import { useRole } from "../../context/RoleDataContext";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import TablePagination from "@material-ui/core/TablePagination";
import { useStyles } from "../../components/Styles";
import ProductModal from "../../components/Modal";
import clsx from "clsx";

export default function PurchaseCustomer(props){
    const accounts = props.accounts;
    const classes = useStyles();
    const supplyChainContract = props.supplyChainContract;
    const { roles } = useRole();
    const [count, setCount] = React.useState(0);
    const [allProducts, setAllProducts] = React.useState([]);
    const navItem = [
        ["Purchase Product","/Customer/buy"],
        ["Receive Product", "/Customer/receive"],
        ["All Products","/Customer/allReceived"]
      ];
    React.useEffect(() => {
        (async () => {
        const cnt = await supplyChainContract.methods.fetchProductCount().call();
        setCount(cnt);
        console.log(count)
        }) ();

        (async () => {
            const arr = [];
            for (var i = 1; i < count; i++) {
              const prodState = await supplyChainContract.methods
                .fetchProductState(i)
                .call();
      
              if (prodState === "3") {
                const prodData = [];
                const a = await supplyChainContract.methods
                  .fetchProductPart1(i, "product", 0)
                  .call();
                const b = await supplyChainContract.methods
                  .fetchProductPart2(i, "product", 0)
                  .call();
                const c = await supplyChainContract.methods
                  .fetchProductPart3(i, "product", 0)
                  .call();
                prodData.push(a);
                prodData.push(b);
                prodData.push(c);
                arr.push(prodData);
              }
            }
            setAllProducts(arr);
            
            }) ();

    }, [count]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    };
  
    const [open, setOpen] = React.useState(false);
    const [modalData, setModalData] = React.useState([]);
  
    const handleClose = () => setOpen(false);
  
    const handleClick = async (prod) => {
      await setModalData(prod);
      console.log(modalData);
      setOpen(true);
    };

    const handleBuyButton = async id => {
        await supplyChainContract.methods.purchaseByCustomer(id).send({ from: roles.customer, gas:1000000 })
        .on('transactionHash', function(hash){
          handleSetTxhash(id, hash);
      });
        setCount(0);
    }

    const handleSetTxhash =  async (id, hash) => { 
      await supplyChainContract.methods.setTransactionHash(id, hash).send({ from: roles.manufacturer, gas:900000 });
  }

    return(
        <>
         <div classname={classes.pageWrap}>
        <Navbar navItems={navItem}>
        <ProductModal prod={modalData} open={open} handleClose={handleClose} />

        <h1 className={classes.pageHeading}>All Products</h1>
        <h3 className={classes.tableCount}>Total : {allProducts.length}</h3>


        <div>
          <Paper className={classes.TableRoot}>
            <TableContainer className={classes.TableContainer}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.TableHead} align="left">
                      Universal ID
                    </TableCell>
                    <TableCell className={classes.TableHead} align="center">
                      Product Code
                    </TableCell>
                    <TableCell className={classes.TableHead} align="center">
                      Manufacturer
                    </TableCell>
                    <TableCell className={classes.TableHead} align="center">
                      Manufacture Date
                    </TableCell>
                    <TableCell className={classes.TableHead} align="center">
                      Product Name
                    </TableCell>
                    <TableCell
                      className={clsx(classes.TableHead, classes.AddressCell)}
                      align="center"
                    >
                      Owner
                    </TableCell>
                    <TableCell
                      className={clsx(classes.TableHead)}
                      align="center"
                    >
                      Buy
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allProducts.length !== 0 ? (
                    allProducts
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((prod) => {
                        return (
                            <>
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={prod[0][0]}
                            
                          >
                            <TableCell
                              className={classes.TableCell}
                              component="th"
                              align="left"
                              scope="row"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[0][0]}
                            </TableCell>
                            <TableCell
                              className={classes.TableCell}
                              align="center"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[1][2]}
                            </TableCell>
                            <TableCell
                              className={classes.TableCell}
                              align="center"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[0][4]}
                            </TableCell>
                            <TableCell align="center" onClick={() => handleClick(prod)}>{prod[1][0]}</TableCell>
                            <TableCell
                              className={classes.TableCell}
                              align="center"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[1][1]}
                            </TableCell>
                            <TableCell
                              className={clsx(
                                classes.TableCell,
                                classes.AddressCell
                              )}
                              align="center"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[0][2]}
                            </TableCell>
                            <TableCell
                           className={clsx(classes.TableCell)}
                           align="center"
                         >
                           <Button
                             type="submit"
                             variant="contained"
                             color="primary"
                             onClick={() => handleBuyButton(prod[0][0])}
                           >
                             BUY
                           </Button>
                         </TableCell>
                          </TableRow>
                           
                         </>
                        );
                      })
                  ) : (
                    <> </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={allProducts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
          </Navbar>

        </div>
        </>
    )
}