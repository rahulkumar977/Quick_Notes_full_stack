import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { GridBackground } from '../../components/common/GridBackground';
import { authApi } from '../../services/authApi';
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../store/slices/authSlice';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: 'B.Tech CSE',
    semester: 1,
    agreed: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation rules (8+ chars, 1 uppercase, 1 lowercase, 1 number)
  const passwordCriteria = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(formData.password) },
    { label: 'One number (0-9)', met: /\d/.test(formData.password) },
  ];
  const isPasswordStrong = passwordCriteria.every((c) => c.met);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!formData.password) {
      toast.error('Please enter your password.');
      return;
    }

    if (!isPasswordStrong) {
      toast.error('Password criteria not matched.');
      return;
    }

    if (!formData.confirmPassword) {
      toast.error('Please confirm your password.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!formData.agreed) {
      toast.error('Please accept the terms to continue.');
      return;
    }

    dispatch(setLoading(true));

    try {
      await authApi.signup({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        academicCourse: formData.course,
        currentSemester: Number(formData.semester),
      });

      toast.success('Check your email for OTP.');
      navigate('/verify-email', { state: { email: formData.email.trim() } });
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <GridBackground isFullPage showGlow={true} mask="radial" className="flex items-center justify-center">
      <div className="sm:min-w-2xl w-full bg-white/95 dark:bg-[#0d0e13]/95 backdrop-blur-md  border border-slate-200/80 dark:border-slate-800 p-8 space-y-6 shadow-2xl transition-all md:my-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-block mb-1">
            <Logo size="md" onClick={() => navigate('/')} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create an account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sign up to manage and access academic notes</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-y-3">
          <TextField
            fullWidth
            size="small"
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Ram Kumar"
          />

          <TextField
            fullWidth
            size="small"
            label="Enter Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@gmail.com"
          />

          <div className="grid grid-cols-2 gap-x-2">
            <FormControl fullWidth size="small">
              <InputLabel>Academic Course</InputLabel>
              <Select
                name="course"
                value={formData.course}
                label="Academic Course"
                onChange={handleChange}
              >
                <MenuItem value="B.Tech CSE">B.Tech CSE</MenuItem>
                <MenuItem value="B.Tech ECE">B.Tech ECE</MenuItem>
                <MenuItem value="BCA">BCA</MenuItem>
                <MenuItem value="MCA">MCA</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Current Semester</InputLabel>
              <Select
                name="semester"
                value={formData.semester}
                label="Current Semester"
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    Semester {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <TextField
            fullWidth
            size="small"
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-slate-600" />
                      ) : (
                        <Eye size={18} className="text-slate-500" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Password Validation Checklist */}
          <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Password requirements:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {passwordCriteria.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 transition-colors duration-150 ${
                    item.met ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all duration-150 ${
                      item.met
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-transparent'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="text-[11px]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <TextField
            fullWidth
            size="small"
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} className="text-slate-600 dark:text-slate-300" />
                      ) : (
                        <Eye size={18} className="text-slate-400 dark:text-slate-500" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                name='agreed'
                checked={formData.agreed}
                onChange={handleChange}
                sx={{ color: 'var(--primary)', '&.Mui-checked': { color: 'var(--primary)' } }}
              />
            }
            label={
              <span className="text-xs text-slate-600 dark:text-slate-300">
                I agree to the Terms of Service & Privacy Policy
              </span>
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: 'var(--primary)',
              '&:hover': { backgroundColor: 'var(--primary-hover)' },
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              padding: '9px 16px',
              borderRadius: '10px',
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary dark:text-yellow-300 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </GridBackground>
  );
};

export default RegisterPage;
