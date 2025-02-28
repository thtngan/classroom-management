import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 18,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  fontSize: 16,
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function PreUploadGradeTable({grade}) {

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 300 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Student ID</StyledTableCell>
            <StyledTableCell>Grade</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            grade.length
              ?
              grade.map((row) => (
                <StyledTableRow key={row.student.studentId}>
                  <StyledTableCell component="th" scope="row">
                    {row.student.studentId}
                  </StyledTableCell>
                  <StyledTableCell>{row.grades[0].grade}</StyledTableCell>
                </StyledTableRow>
              ))
              : <Typography>No student found. Please import the student list first.</Typography>
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
