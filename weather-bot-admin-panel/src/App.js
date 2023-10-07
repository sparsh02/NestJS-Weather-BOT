import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Link,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch API key and user list on component mount
    fetchApiKey();
    fetchUsers();
  }, []);

  const fetchApiKey = () => {
    // Replace with your Nest.js API endpoint to fetch the API key
    axios.get('/admin/api-key')
      .then((response) => {
        setApiKey(response.data);
      })
      .catch((error) => {
        console.error('Error fetching API key:', error);
      });
  };

  const updateApiKey = () => {
    // Replace with your Nest.js API endpoint to update the API key
    const newApiKey = prompt('Enter the new API key:');
    if (newApiKey) {
      axios.post('/admin/api-key', { key: newApiKey })
        .then((response) => {
          alert(response.data);
          fetchApiKey(); // Refresh the API key after update
        })
        .catch((error) => {
          console.error('Error updating API key:', error);
        });
    }
  };

  const deleteUser = (chatId) => {
    // Send a DELETE request to delete the user
    axios.delete(`/users/${chatId}`)
      .then((response) => {
        alert(response.data.message);
        fetchUsers(); // Refresh the user list after deletion
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
      });
  };

  const fetchUsers = () => {
    // Replace with your Nest.js API endpoint to fetch the list of users
    axios.get('/users')
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Weather Admin Dashboard</Typography>

      {/* Box for Managing API Keys */}
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h5" gutterBottom>Manage API Key</Typography>
        <Typography variant="body1" gutterBottom>Current API Key: {apiKey}</Typography>
        <Button variant="contained" color="primary" onClick={updateApiKey} style={{ marginTop: '10px' }}>
          Update API Key
        </Button>
      </Paper>

      {/* Box for Listing Current Users */}
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography variant="h5" gutterBottom>Current Users</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Chat ID</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.chatId}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.chatId}</TableCell>
                  <TableCell>
                    <IconButton aria-label="delete" onClick={() => deleteUser(user.chatId)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Footer */}
      <Typography variant="body2" style={{ marginTop: '20px' }}>
        You can find the bot at: <Link href="https://telegram-link-to-bot" target="_blank" rel="noopener noreferrer">https://telegram-link-to-bot</Link>
      </Typography>
    </Container>
  );
}

export default App;
