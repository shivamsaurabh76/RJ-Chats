import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
  Box,
  Text,
  Divider,
  HStack,
} from "@chakra-ui/react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const history = useHistory();

  const handleClick = () => setShow(!show);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/google-auth",
        { token: credentialResponse.credential },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      
      localStorage.setItem("userInfo", JSON.stringify(data));
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Google sign in failed",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <VStack spacing="5px" width="100%" maxWidth="400px" mx="auto">
        <Box 
          width="100%" 
          p={4} 
          borderRadius="lg" 
          borderWidth="1px"
          boxShadow="md"
        >
          <VStack spacing={6}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast({
                  title: "Google Sign In Failed",
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                  position: "bottom",
                });
              }}
              useOneTap
              type="standard"
              theme="outline"
              size="large"
              width="100%"
              text="signin_with"
            />

            <HStack width="100%" justify="center" align="center">
              <Divider flex={1} />
              <Text px={3} color="gray.500" fontSize="sm">
                Or
              </Text>
              <Divider flex={1} />
            </HStack>

          <Text fontSize="xl" fontWeight="bold" alignSelf="center">
            Sign in with email
          </Text>

          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              size="lg"
              placeholder="Enter Your Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                size="lg"
                type={show ? "text" : "password"}
                placeholder="Enter Your Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <InputRightElement width="4.5rem" height="100%">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            colorScheme="blue"
            width="100%"
            size="lg"
            onClick={submitHandler}
            isLoading={loading}
          >
            Sign In
          </Button>

          {/* Hidden GoogleLogin component for handling OAuth */}
          <Box display="none">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast({
                  title: "Google Sign In Failed",
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                  position: "bottom",
                });
              }}
            />
          </Box>
          </VStack>
          </Box>
        </VStack>
    </GoogleOAuthProvider>
  );
};

export default Login;