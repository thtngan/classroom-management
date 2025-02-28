import * as React from 'react';
import {TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, TablePagination} from '@mui/material';

const TableClasses = ({users, clickRow}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  if (!users || !Array.isArray(users)) {
    // Handle the case where rows is null, undefined, or not an array
    return null;
  }


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (row) => {
    // Handle the row click, for example, log the clicked row's name
    console.log(`Clicked on row: ${row.email}`);
    clickRow(row)
  };

  const ClickableTableRow = ({ row, children }) => {
    return (
      <TableRow
        key={row.email}
        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
        onClick={() => handleRowClick(row)}
      >
        {children}
      </TableRow>
    );
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="left">Email</TableCell>
              <TableCell align="center">Student ID</TableCell>
              <TableCell align="center">Status</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <ClickableTableRow key={row.email} row={row}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="left">{row.email}</TableCell>
                  <TableCell align="center">{row.studentId}</TableCell>
                  <TableCell align="center">{row.status}</TableCell>

                </ClickableTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default TableClasses;
