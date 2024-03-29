import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormLabel from '@mui/material/FormLabel';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { Seo } from 'src/components/seo';
import { Layout as InviteLayout } from 'src/layouts/invite/classic-layout';
import { paths } from 'src/paths';
import { useEffect, useState } from "react";
import sendHttpRequest from "../../utils/send-http-request";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const Page = () => {
  const router = useRouter();
  const { inviteId } = router.query;
  const [roomname, setroomname] = useState(null);
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if(!router.isReady) return;
    const decoderoomId = atob(inviteId);
    const parts = decoderoomId.split('=');
    const gotroomId = parts[1];
    sendHttpRequest(
        `http://localhost:8000/events/${gotroomId}/`,
        'GET'
    ).then(response => {
      if (response.status === 200 || response.status === 201) {
        setroomname(response.data.title);
      } else if (response.status === 401 || response.status === 403) {
        router.push('/401');
      } else if (response.status === 404) {
        router.push('/404');
      } else {
        router.push('/500');
      }
    });
  }, [inviteId, router]);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleJoin = () => {
    if(!router.isReady) return;
    const token = localStorage.getItem('JWT');
    if (!token) {
      const returnTo = encodeURIComponent(window.location.href);
      window.location.href = `/login?returnTo=${returnTo}`;
    } else {
      const myroomId = atob(inviteId);
      const parts = myroomId.split('=');
      const finalroomId = parts[1];
      console.log("finalRoom ID is: " + finalroomId);
      sendHttpRequest(
          'http://localhost:8000/events/join/',
          'PUT',
          { id: finalroomId }
      ).then(response => {
        if (response.status === 200 || response.status === 201) {
          setSeverity('success');
          setMessage('You have successfully joined the room!');
          setOpen(true);
          router.push(`${paths.roomDetails.replace(':roomId', finalroomId)}`);
        } else if (response.status === 401) {
          router.push('/401');
        } else if (response.status === 400) {
          setSeverity('warning');
          setMessage(response.data.message);
          setOpen(true);
        }
      }).catch(error => {
        setSeverity('error');
        setMessage(response.data.message);
        setOpen(true);
      });
    }
  };

  return (
      <>
        <Snackbar
          open={open}
          autoHideDuration={5000}
          onClose={handleClose}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        >
          <Alert
            onClose={handleClose}
            severity={severity}
            variant="filled"
            sx={{width: '100%'}}
          >
            {message}
          </Alert>
        </Snackbar>

        <Seo title="Invitation" />
        <div>
          <Box sx={{ mb: 4 }}>
            <Typography
                color="text.primary"
                sx={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={handleBackToHome}
            >
              <SvgIcon sx={{ mr: 1 }}>
                <ArrowLeftIcon />
              </SvgIcon>
              Back to Home Page
            </Typography>
          </Box>
          <Card elevation={16}>
            <CardHeader
                sx={{ pb: 0 }}
                title="Let's Pal !"
            />
            <CardContent>
              <form noValidate>
                <FormLabel
                    sx={{
                      display: 'block',
                      mb: 2,
                      fontSize: '1rem',
                    }}
                >
                  Room Name: <span>{roomname}</span>
                </FormLabel>
                <Button
                    fullWidth
                    size="large"
                    sx={{ mt: 2 }}
                    type="button" // Changed to "button" since it's no longer submitting a form
                    startIcon={
                      <SvgIcon>
                        <SentimentSatisfiedAltIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                    onClick={handleJoin} // Using onClick to trigger join
                >
                  Join the room
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </>
  );
};

Page.getLayout = (page) => <InviteLayout>{page}</InviteLayout>;

export default Page;
