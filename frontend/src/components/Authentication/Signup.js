import React, { useState, useRef, useEffect } from "react";
import { 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  InputGroup, 
  InputRightElement, 
  VStack, 
  HStack, 
  useToast,
  Text,
  Link,
  Box,
  Divider,
  Container,
} from "@chakra-ui/react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import axios from "axios";
import { useHistory } from "react-router-dom";
import cloudinaryConfig from '../config/cloudinaryConfig';

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const toast = useToast();
  const history = useHistory();
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

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
        title: "Registration Successful",
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


  // Effect for hiding verification message
  useEffect(() => {
    let timer;
    if (isVerified) {
      setShowVerification(true);
      timer = setTimeout(() => {
        setShowVerification(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isVerified]);

  // Effect for resend timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatPhoneNumber = (number) => {
    let cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 10 && !cleaned.startsWith('+91')) {
      cleaned = '+91' + cleaned;
    }
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    setIsVerified(false);
    setOtpSent(false);
    setPhoneNumber(value);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }
  };

  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^(\+?91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber.replace(/\D/g, ''));
  };

  const handleCancel = () => {
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setIsVerified(false);
  };

  const handleResend = async () => {
    if (resendDisabled) return;
    
    setResendDisabled(true);
    setResendTimer(30); // 30 seconds cooldown
    setOtp(["", "", "", "", "", ""]);
    
    try {
      await sendOTP();
    } catch (error) {
      toast({
        title: "Error Resending OTP",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", cloudinaryConfig.uploadPreset);
      data.append("cloud_name", cloudinaryConfig.cloudName);
      
      fetch(cloudinaryConfig.uploadUrl, {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    setSendOtpLoading(true);
    
    if (!validatePhone(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Indian mobile number",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setSendOtpLoading(false);
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      // eslint-disable-next-line
      const { data } = await axios.post(
        "/api/user/sendotp",
        { phoneNumber: formattedPhone },
        config
      );

      toast({
        title: "OTP Sent Successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setOtpSent(true);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Failed to send OTP",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    setSendOtpLoading(false);
  };

  const verifyOTP = async () => {
    setVerifyOtpLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/verifyotp",
        { 
          phoneNumber: formattedPhone,
          otp: otp.join("")
        },
        config
      );

      if (data.success) {
        toast({
          title: "Mobile Number Verified Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setIsVerified(true);
        setOtpSent(false);
      }
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Failed to verify OTP",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    setVerifyOtpLoading(false);
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmpassword) {
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
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
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
        "/api/user",
        { name, email, password, pic },
        config
      );

      toast({
        title: "Registration Successful",
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
        description: error.response?.data?.message || "Registration failed",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  // eslint-disable-next-line
  const otpInputStyle = {
    letterSpacing: "0.5em",
    textAlign: "center",
    fontSize: "1.2em",
    fontWeight: "bold",
    width: "100%",
    padding: "0.5em",
    border: "2px solid #e2e8f0",
    borderRadius: "0.375rem",
    outline: "none",
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Container maxW="container.sm" py={1}>
        <VStack spacing="5px" width="100%">
          <Box 
            width="100%" 
            p={6} 
            borderRadius="lg" 
            borderWidth="1px"
            boxShadow="md"
            bg="white"
          >
            <VStack spacing={6}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast({
                    title: "Google Sign Up Failed",
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
                text="signup_with"
              />

              <HStack width="100%" justify="center" align="center">
                <Divider flex={1} />
                <Text px={3} color="gray.500" fontSize="sm">
                  Or
                </Text>
                <Divider flex={1} />
              </HStack>

            <Text fontSize="xl" fontWeight="bold" alignSelf="center">
              Sign up with email
            </Text>
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm Your Password"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>
      <FormControl id="phone-number">
        <FormLabel>Mobile Number</FormLabel>
        <Input
          placeholder="Enter Your Phone Number"
          value={phoneNumber}
          onChange={handlePhoneChange}
          maxLength={12}
          isDisabled={otpSent && !isVerified}
        />
      </FormControl>

      {!isVerified && !otpSent && (
        <Button
          colorScheme="blue"
          width="100%"
          style={{ marginTop: 15 }}
          onClick={sendOTP}
          isLoading={sendOtpLoading}
        >
          Send OTP
        </Button>
      )}

      {otpSent && !isVerified && (
        <>
          <FormControl id="otp">
            <FormLabel>Enter OTP</FormLabel>
            <HStack     spacing={{ base: "2", sm: "4" }}
                        justifyContent="center"
                        wrap="wrap">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={otpRefs.current[index]}
                  textAlign="center"
                  width="12"
                  height="12"
                  fontSize="lg"
                  border="2px"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px blue.500"
                  }}
                />
              ))}
            </HStack>
          </FormControl>

          <Text fontSize="sm" textAlign="center" mt={2}>
            Didn't receive code?{" "}
            <Link
              color="blue.500"
              onClick={handleResend}
              isDisabled={resendDisabled}
              _hover={{ textDecoration: "underline" }}
            >
              {resendDisabled ? `Resend in ${resendTimer}s` : "Resend"}
            </Link>
          </Text>

          <HStack spacing={4} justifyContent="space-between" width="100%" mt={4}>
            <Button
              colorScheme="gray"
              flex="1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              flex="1"
              onClick={verifyOTP}
              isLoading={verifyOtpLoading}
            >
              Verify
            </Button>
          </HStack>
        </>
      )}

      {showVerification && isVerified && (
        <FormControl>
          <div style={{ color: "green", textAlign: "center" }}>
            ✓ Mobile Number Verified Successfully
          </div>
        </FormControl>
      )}

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
        isDisabled={!isVerified}
      >
        Sign Up
      </Button>

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
      </Container>
    </GoogleOAuthProvider>
  );
};

export default Signup;