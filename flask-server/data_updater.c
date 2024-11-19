#include <stdio.h>
#include <stdlib.h>
#include <unistd.h> // for sleep()
#include <time.h>   // for time()

#define TIME_FILE "update_time.txt"

void write_next_run_time(time_t next_run_time) {
    FILE *file = fopen(TIME_FILE, "w");
    if (file) {
        fprintf(file, "%ld\n", next_run_time);
        fclose(file);
    } else {
        perror("Error opening file for writing");
    }
}

time_t read_next_run_time() {
    time_t next_run_time = 0;
    FILE *file = fopen(TIME_FILE, "r");
    if (file) {
        fscanf(file, "%ld", &next_run_time);
        fclose(file);
    }
    return next_run_time;
}

int main() {
    time_t now;
    time_t next_run_time;

    // Command to execute
    const char *command = "python pull.py";
    const char *command2 = "python clean.py";
    
    // Time till next update
    long sleep_time = 7 * 24 * 60 * 60; // in seconds
    printf("inited vars\n");

    // Read from file to get time for next update
    next_run_time = read_next_run_time();
    printf("read next run time\n");

    while (1) {
	now = time(NULL);
        if (now >= next_run_time) {
            system(command);
            sleep(30);
            system(command2);
            next_run_time = now + sleep_time;
	    printf("writing new run time\n");
            write_next_run_time(next_run_time);
        }
	//check if it's time to update every two hours
	sleep(2*60*60);
    }

    return 0;
}