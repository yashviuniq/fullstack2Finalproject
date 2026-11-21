@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script for Windows
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "1" (@ECHO ON) ELSE (@ECHO OFF)

@SETLOCAL EnableExtensions EnableDelayedExpansion

SET "ERROR_CODE=0"

@REM set %~d0 = drive letter of the batch file
@REM set %~p0 = path to the batch file without drive letter
@REM set %~n0 = name of the batch file
@REM set %~x0 = extension of the batch file
@REM set %~s0 = short name of the batch file

SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"

IF DEFINED JAVA_HOME (
  IF EXIST "%JAVA_HOME%\bin\java.exe" (
    SET "JAVACMD=%JAVA_HOME%\bin\java.exe"
  )
)
IF NOT DEFINED JAVACMD (
  IF EXIST "C:\Users\Asus\.jdks\jdk-21.0.13+9\bin\java.exe" (
    SET "JAVACMD=C:\Users\Asus\.jdks\jdk-21.0.13+9\bin\java.exe"
  ) ELSE (
    SET "JAVACMD=java"
  )
)

IF EXIST "%WRAPPER_JAR%" GOTO run

@REM Download wrapper jar if not present
SET "DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR%')}"

:run
"%JAVACMD%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" -cp "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%
