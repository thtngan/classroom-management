import * as React from 'react';
import {TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, TablePagination} from '@mui/material';

const TableClasses = ({classes, clickRow}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  if (!classes || !Array.isArray(classes)) {
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
    console.log(`Clicked on row: ${row.classCode}`);
    clickRow(row.classCode)
  };

  const ClickableTableRow = ({ row, children }) => {
    return (
      <TableRow
        key={row.classCode}
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
              <TableCell>Class Name</TableCell>
              <TableCell align="center">Class Owner</TableCell>
              <TableCell align="center">Number of Student</TableCell>
              <TableCell align="center">Class Code</TableCell>
              <TableCell align="center">Invitation Code</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <ClickableTableRow key={row.name} row={row}>
                  <TableCell component="th" scope="row">
                    {row.className}
                  </TableCell>
                  <TableCell align="center">{row.classOwner.name}</TableCell>
                  <TableCell align="center">{row.students.length}</TableCell>
                  <TableCell align="center">{row.classCode}</TableCell>
                  <TableCell align="center">{row.invitationCode}</TableCell>
                </ClickableTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={classes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default TableClasses;
